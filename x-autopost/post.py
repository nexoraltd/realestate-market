#!/usr/bin/env python3
"""
不動産相場ナビ X自動投稿スクリプト
使い方: python post.py [morning|noon|night]
PM2 cron: 8:00/12:30/20:00

セットアップ:
1. .env に X API キーを設定
2. pm2 start ecosystem.config.js
"""

import sys
import os
import json
import random
import re
from pathlib import Path
from datetime import datetime

import tweepy
from dotenv import load_dotenv

_env_path = Path(__file__).parent / ".env"
if not _env_path.exists():
    _env_path = Path(".env")
load_dotenv(_env_path)

API_KEY = os.getenv("X_API_KEY")
API_KEY_SECRET = os.getenv("X_API_KEY_SECRET")
ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")

STATE_FILE = Path(__file__).parent / "state.json"
LOG_FILE = Path(__file__).parent / "post.log"


def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"morning_idx": 0, "noon_idx": 0, "night_idx": 0}


def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    try:
        print(line)
    except Exception:
        pass
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def post_tweet(text: str) -> bool:
    """tweepy v2 でツイート。失敗時はハッシュタグ除去→短縮の段階的リトライ。"""
    if not all([API_KEY, API_KEY_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET]):
        log("ERROR: X API credentials not set in .env")
        return False

    client = tweepy.Client(
        consumer_key=API_KEY,
        consumer_secret=API_KEY_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_TOKEN_SECRET,
    )

    attempts = [
        text,
        re.sub(r"#\S+", "", text).strip(),  # ハッシュタグ除去
    ]

    for i, body in enumerate(attempts):
        try:
            resp = client.create_tweet(text=body)
            tweet_id = resp.data.get("id", "?")
            log(f"OK (attempt {i+1}): id={tweet_id}")
            return True
        except Exception as e:
            log(f"FAIL (attempt {i+1}): {e}")

    return False


def main():
    from templates import MORNING_TEMPLATES, NOON_TEMPLATES, NIGHT_TEMPLATES, PREMIUM_TEMPLATES

    slot = sys.argv[1] if len(sys.argv) > 1 else "morning"
    templates_map = {
        "morning": MORNING_TEMPLATES,
        "noon": NOON_TEMPLATES,
        "night": NIGHT_TEMPLATES,
    }
    templates = templates_map.get(slot, MORNING_TEMPLATES)
    idx_key = f"{slot}_idx"

    state = load_state()
    idx = state.get(idx_key, 0) % len(templates)

    # 朝・夜は3回に1回の頻度でプレミアム訴求テンプレートを使用
    premium_idx_key = "premium_idx"
    use_premium = slot in ("morning", "night") and idx % 3 == 0 and PREMIUM_TEMPLATES
    if use_premium:
        p_idx = state.get(premium_idx_key, 0) % len(PREMIUM_TEMPLATES)
        text = PREMIUM_TEMPLATES[p_idx]
        state[premium_idx_key] = (p_idx + 1) % len(PREMIUM_TEMPLATES)
        log(f"Slot={slot}, PREMIUM idx={p_idx}, len={len(text)}")
    else:
        text = templates[idx]
        log(f"Slot={slot}, idx={idx}, len={len(text)}")

    ok = post_tweet(text)

    state[idx_key] = (idx + 1) % len(templates)
    save_state(state)

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
