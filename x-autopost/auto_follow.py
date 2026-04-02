#!/usr/bin/env python3
"""
不動産相場ナビ X自動フォロースクリプト

不動産関連キーワードでユーザーを検索し、1日10-15人ずつ自動フォロー。
フォロー済み・スキップリストを管理して重複を防ぐ。

使い方:
  python auto_follow.py           → 検索+フォロー実行（デフォルト15人）
  python auto_follow.py --dry-run → 検索のみ（フォローしない）
  python auto_follow.py --count 10 → フォロー数を指定
  python auto_follow.py --stats   → フォロー統計表示

PM2 cron: 毎日10:00と18:00に実行
"""

import json
import os
import sys
import random
import time
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlencode, quote
from urllib.error import URLError

import tweepy
from dotenv import load_dotenv

_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

SCRIPT_DIR = Path(__file__).parent
STATE_FILE = SCRIPT_DIR / "follow_state.json"
LOG_FILE = SCRIPT_DIR / "follow.log"

API_KEY = os.getenv("X_API_KEY")
API_KEY_SECRET = os.getenv("X_API_KEY_SECRET")
ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")

# 不動産関連の検索キーワード（ローテーション）
SEARCH_QUERIES = [
    "不動産投資", "マンション 売却", "住宅ローン 金利",
    "不動産 相場", "マンション 購入", "中古マンション",
    "不動産 査定", "マイホーム", "住み替え",
    "ワンルーム投資", "不動産 仲介", "マンション管理",
    "土地 売買", "リノベーション", "固定資産税",
    "不動産 確定申告", "相続 不動産", "賃貸経営",
]

# フォローしないアカウントのパターン
SKIP_PATTERNS = [
    "bot", "pr", "広告", "キャンペーン", "公式",
]


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "followed": [],        # フォロー済みscreen_names
        "skipped": [],         # スキップしたscreen_names
        "query_idx": 0,        # 次のクエリインデックス
        "total_followed": 0,   # 累計フォロー数
        "last_run": None,
    }


def save_state(state):
    state["last_run"] = datetime.now().isoformat()
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def get_client():
    if not all([API_KEY, API_KEY_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET]):
        log("ERROR: X API credentials not set")
        return None
    return tweepy.Client(
        consumer_key=API_KEY,
        consumer_secret=API_KEY_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_TOKEN_SECRET,
    )


def search_users_v1(query, count=20):
    """v1.1 search/typeahead でユーザー検索（tweepy不要、直接HTTP）"""
    # tweepy v2 doesn't support user search well, use v1.1 via OAuth1
    import hmac
    import hashlib
    import base64
    import urllib.parse

    # OAuth 1.0a signature generation
    oauth_params = {
        "oauth_consumer_key": API_KEY,
        "oauth_nonce": os.urandom(16).hex(),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": ACCESS_TOKEN,
        "oauth_version": "1.0",
    }

    url = "https://api.twitter.com/1.1/users/search.json"
    query_params = {"q": query, "count": str(count), "page": "1"}

    # Combine params for signature base
    all_params = {**oauth_params, **query_params}
    sorted_params = "&".join(f"{quote(k, safe='')}={quote(v, safe='')}"
                             for k, v in sorted(all_params.items()))
    base_string = f"GET&{quote(url, safe='')}&{quote(sorted_params, safe='')}"

    signing_key = f"{quote(API_KEY_SECRET, safe='')}&{quote(ACCESS_TOKEN_SECRET, safe='')}"
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()

    oauth_params["oauth_signature"] = signature
    auth_header = "OAuth " + ", ".join(
        f'{quote(k, safe="")}="{quote(v, safe="")}"'
        for k, v in sorted(oauth_params.items())
    )

    req_url = f"{url}?{urlencode(query_params)}"
    req = Request(req_url, headers={
        "Authorization": auth_header,
        "User-Agent": "NexoraAutoFollow/1.0",
    })

    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data  # List of user objects
    except Exception as e:
        log(f"  Search error: {e}")
        return []


def should_follow(user, state):
    """フォロー対象かどうかを判定"""
    sn = user.get("screen_name", "").lower()

    # Already processed
    if sn in state["followed"] or sn in state["skipped"]:
        return False

    # Skip self
    if sn == "nexora_market":
        return False

    # Skip patterns
    name_lower = user.get("name", "").lower() + " " + sn
    for pat in SKIP_PATTERNS:
        if pat in name_lower:
            return False

    # Skip protected accounts (can't see their tweets)
    if user.get("protected"):
        return False

    # Prefer users with reasonable follower counts (more likely to follow back)
    followers = user.get("followers_count", 0)
    following = user.get("friends_count", 0)

    # Skip very large accounts (won't follow back)
    if followers > 10000:
        return False

    # Skip inactive (no tweets or very few)
    if user.get("statuses_count", 0) < 10:
        return False

    # Prefer users who follow more than they have followers (follow-back friendly)
    if following > 0 and followers / following > 5:
        return False

    return True


def follow_user(client, screen_name):
    """tweepy v2でフォロー"""
    try:
        # Get user ID first
        user = client.get_user(username=screen_name)
        if not user.data:
            return False, "user not found"
        uid = user.data.id

        result = client.follow_user(uid)
        return True, "ok"
    except tweepy.TooManyRequests:
        return False, "rate_limit"
    except tweepy.Forbidden as e:
        return False, f"forbidden: {e}"
    except Exception as e:
        return False, str(e)


def cmd_run(max_follow=15, dry_run=False):
    state = load_state()
    client = get_client()
    if not client and not dry_run:
        return

    log(f"=== Auto Follow {'(DRY RUN) ' if dry_run else ''}開始 (max={max_follow}) ===")

    # Pick 3 random queries
    queries = random.sample(SEARCH_QUERIES, min(3, len(SEARCH_QUERIES)))
    log(f"検索キーワード: {queries}")

    candidates = []
    for q in queries:
        log(f"  検索中: {q}")
        users = search_users_v1(q)
        for u in users:
            if should_follow(u, state):
                candidates.append(u)
        time.sleep(1)

    # Deduplicate
    seen = set()
    unique = []
    for u in candidates:
        sn = u["screen_name"].lower()
        if sn not in seen:
            seen.add(sn)
            unique.append(u)

    log(f"候補: {len(unique)}人")

    if not unique:
        log("フォロー候補が見つかりませんでした")
        save_state(state)
        return

    # Shuffle for variety
    random.shuffle(unique)

    followed_count = 0
    for u in unique:
        if followed_count >= max_follow:
            break

        sn = u["screen_name"]

        if dry_run:
            log(f"  [DRY] @{sn} ({u['name']}, {u['followers_count']}F)")
            followed_count += 1
            continue

        log(f"  フォロー中: @{sn} ({u['name']}, {u['followers_count']}F)")
        ok, msg = follow_user(client, sn)

        if ok:
            state["followed"].append(sn.lower())
            state["total_followed"] += 1
            followed_count += 1
            log(f"    ✅ フォロー成功")
        elif msg == "rate_limit":
            log(f"    ⚠️ レートリミット。終了。")
            break
        else:
            state["skipped"].append(sn.lower())
            log(f"    ❌ {msg}")

        time.sleep(random.uniform(2, 5))  # Human-like delay

    save_state(state)
    log(f"=== 完了: {followed_count}人フォロー (累計: {state['total_followed']}) ===")


def cmd_stats():
    state = load_state()
    print(f"累計フォロー: {state['total_followed']}人")
    print(f"フォロー済み: {len(state['followed'])}件")
    print(f"スキップ: {len(state['skipped'])}件")
    print(f"最終実行: {state.get('last_run', 'なし')}")


def main():
    args = sys.argv[1:]

    if "--stats" in args:
        cmd_stats()
        return

    dry_run = "--dry-run" in args
    count = 15
    if "--count" in args:
        idx = args.index("--count")
        if idx + 1 < len(args):
            count = int(args[idx + 1])

    cmd_run(max_follow=count, dry_run=dry_run)


if __name__ == "__main__":
    main()
