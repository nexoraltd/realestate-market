#!/usr/bin/env python3
"""
季刊 不動産相場レポート — 承認制送信スクリプト

使い方:
  python send_quarterly.py           → ドラフト生成（自動cron用）
  python send_quarterly.py --approve → 最新ドラフトを全購読者に送信
  python send_quarterly.py --preview → 最新ドラフトのサマリーをターミナル表示
  python send_quarterly.py --list    → ドラフト一覧表示

PM2 cron: 1月・4月・7月・10月の第2月曜 9:00（四半期データ公開後）

処理フロー:
1. subscribers.json から購読者リスト読み込み
2. 国交省API（不動産情報ライブラリ）から最新＋前四半期データ取得
3. 前期比トレンド算出
4. HTMLレポート生成 → drafts/ に保存
5. 管理者にプレビュー通知メール送信
6. --approve 実行で全購読者に配信
"""

import gzip
import hashlib
import hmac
import json
import os
import sys
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import URLError

# ─── 設定 ───
SCRIPT_DIR = Path(__file__).parent
SUBSCRIBERS_FILE = SCRIPT_DIR / "subscribers.json"
LOG_FILE = SCRIPT_DIR / "send_quarterly.log"
CACHE_DIR = SCRIPT_DIR / "cache"

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
REINFOLIB_API_KEY = os.getenv("REINFOLIB_API_KEY")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")
FROM_EMAIL = "ネクソラ不動産 <noreply@next-aura.com>"
ADMIN_EMAIL = "admin@next-aura.com"
SITE_URL = "https://market.next-aura.com"
DRAFTS_DIR = SCRIPT_DIR / "drafts"

# 主要エリア（レポート対象）
AREAS = [
    ("13", "東京都"),
    ("14", "神奈川県"),
    ("27", "大阪府"),
    ("23", "愛知県"),
    ("40", "福岡県"),
]

# スポットライトエリア（四半期ごとにローテーション）
AREA_SPOTLIGHTS = [
    ("13101", "千代田区", "皇居を中心とした都心の中核。オフィス街でありながら番町・麹町の高級住宅地も。"),
    ("13103", "港区", "六本木・赤坂・白金。外資系企業が多く国際色豊か。平均坪単価は都内トップクラス。"),
    ("14100", "横浜市", "みなとみらい・関内の再開発に加え、東急沿線の住宅地も人気。"),
    ("27100", "大阪市", "梅田・なんばの再開発ラッシュ。万博効果で湾岸エリアにも注目。"),
    ("40130", "福岡市", "天神ビッグバン・博多コネクティッドで都市機能が進化中。人口増加率は政令市No.1。"),
    ("13113", "渋谷区", "IT企業の集積地。代官山・恵比寿の住宅エリアは根強い人気。"),
    ("23100", "名古屋市", "リニア開業見込みで駅周辺が再開発ラッシュ。栄・伏見のマンション需要が堅調。"),
    ("13112", "世田谷区", "23区最大の人口を誇るベッドタウン。三軒茶屋・下北沢の若者文化と閑静な住宅地が混在。"),
]

# 季節別コラム（Q1=1-3月, Q2=4-6月, Q3=7-9月, Q4=10-12月）
QUARTERLY_COLUMNS = {
    "1": (
        "新年度に向けた不動産市場の動き",
        "1〜3月は転勤・入学シーズンで不動産取引が最も活発になる時期です。この時期は購入需要が高まり、売り手に有利な相場が形成されやすい傾向があります。特に都心のファミリー向け物件は成約率が上昇。今期のデータで、あなたのエリアの動きを確認しましょう。"
    ),
    "2": (
        "住宅ローン金利と不動産価格の最新動向",
        "4〜6月は新年度の落ち着きとともに、じっくり物件を探す方が増える時期。日銀の金融政策決定会合の結果も注視されています。金利の方向性は不動産価格に直結するため、最新データで市場トレンドを押さえておきましょう。"
    ),
    "3": (
        "夏の不動産市場 — 閑散期こそ狙い目？",
        "7〜9月はお盆を挟み取引が減少する傾向がありますが、だからこそ交渉に余裕が生まれやすい時期でもあります。売主側の「早く売りたい」という心理を活かせるチャンス。データを見て、狙い目のエリアを探しましょう。"
    ),
    "4": (
        "年末に向けた不動産市場の総括と展望",
        "10〜12月は年内決済を目指す駆け込み需要が発生する時期。来年の市場を占う上でも、今期の取引データは重要な指標になります。1年間の相場変動を振り返り、次のアクションに備えましょう。"
    ),
}


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def check_env():
    """必須の環境変数が設定されているか確認"""
    missing = []
    if not RESEND_API_KEY:
        missing.append("RESEND_API_KEY")
    if not REINFOLIB_API_KEY:
        missing.append("REINFOLIB_API_KEY")
    if not INTERNAL_API_SECRET:
        missing.append("INTERNAL_API_SECRET")
    if missing:
        log(f"ERROR: 環境変数が未設定: {', '.join(missing)}")
        sys.exit(1)


def load_subscribers():
    if not SUBSCRIBERS_FILE.exists():
        return []
    with open(SUBSCRIBERS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [e for e in data if isinstance(e, str) and "@" in e]


def fetch_area_stats(area_code, year, quarter):
    """国交省APIから取引データ取得し、件数と平均価格を返す"""
    params = urlencode({
        "year": year,
        "quarter": quarter,
        "area": area_code,
        "from": f"{year}{quarter}",
        "to": f"{year}{quarter}",
    })
    url = f"https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?{params}"
    req = Request(url, headers={
        "Ocp-Apim-Subscription-Key": REINFOLIB_API_KEY,
        "Accept-Encoding": "gzip",
        "User-Agent": "NexoraNewsletter/1.0",
    })

    try:
        with urlopen(req, timeout=15) as resp:
            raw = resp.read()
            if resp.headers.get("Content-Encoding") == "gzip" or raw[:2] == b'\x1f\x8b':
                raw = gzip.GzipFile(fileobj=BytesIO(raw)).read()
            data = json.loads(raw.decode("utf-8"))
    except (URLError, Exception) as e:
        log(f"  API error for area={area_code}: {e}")
        return None

    transactions = data.get("data", [])
    if not transactions:
        return None

    prices = []
    for t in transactions:
        try:
            p = int(t.get("TradePrice", 0))
            if p > 0:
                prices.append(p)
        except (ValueError, TypeError):
            pass

    if not prices:
        return None

    return {
        "count": len(transactions),
        "avg_price": sum(prices) // len(prices),
        "max_price": max(prices),
        "min_price": min(prices),
    }


def get_latest_quarter():
    """直近の利用可能な四半期を自動検出（東京都でプローブ）"""
    now = datetime.now()
    for offset_months in [3, 6, 9, 12]:
        target = now - timedelta(days=offset_months * 30)
        year = target.year
        month = target.month
        quarter = (month - 1) // 3 + 1
        params = urlencode({
            "year": str(year), "quarter": str(quarter),
            "area": "13", "from": f"{year}{quarter}", "to": f"{year}{quarter}",
        })
        url = f"https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?{params}"
        req = Request(url, headers={
            "Ocp-Apim-Subscription-Key": REINFOLIB_API_KEY,
            "User-Agent": "NexoraNewsletter/1.0",
        })
        try:
            with urlopen(req, timeout=10) as resp:
                raw = resp.read()
                if raw[:2] == b'\x1f\x8b':
                    raw = gzip.GzipFile(fileobj=BytesIO(raw)).read()
                data = json.loads(raw.decode("utf-8"))
                if len(data.get("data", [])) > 100:
                    log(f"  利用可能四半期検出: {year}年 Q{quarter}")
                    return str(year), str(quarter)
        except Exception:
            continue
    target = now - timedelta(days=270)
    year = target.year
    quarter = (target.month - 1) // 3 + 1
    return str(year), str(quarter)


def get_previous_quarter(year, quarter):
    """前四半期の年・四半期番号を返す"""
    y, q = int(year), int(quarter)
    if q == 1:
        return str(y - 1), "4"
    return str(y), str(q - 1)


def load_cache(year, quarter):
    """前回の相場データキャッシュを読み込み"""
    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f"stats_{year}_Q{quarter}.json"
    if cache_file.exists():
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(year, quarter, data):
    """相場データをキャッシュに保存"""
    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f"stats_{year}_Q{quarter}.json"
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def fmt_price(yen):
    if yen >= 100_000_000:
        return f"{yen / 100_000_000:.1f}億円"
    man = yen // 10_000
    return f"{man:,}万円"


def fmt_change(current, previous):
    """前期比の変化率を算出してフォーマット"""
    if not previous or previous == 0:
        return "", ""
    change = (current - previous) / previous * 100
    if change > 0:
        return f"+{change:.1f}%", "#16a34a"  # 緑
    elif change < 0:
        return f"{change:.1f}%", "#dc2626"  # 赤
    return "±0%", "#64748b"  # グレー


def generate_unsubscribe_url(email):
    token = hmac.new(
        INTERNAL_API_SECRET.encode(),
        f"newsletter-unsubscribe:{email}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return f"{SITE_URL}/api/newsletter-unsubscribe?email={email}&token={token}"


def generate_report_html(area_data, prev_area_data, year, quarter, spot_stats):
    """HTMLメールのレポートを生成（季刊: 前期比トレンド付き）"""
    quarter_label = {"1": "1-3月", "2": "4-6月", "3": "7-9月", "4": "10-12月"}.get(quarter, quarter)
    prev_year, prev_quarter = get_previous_quarter(year, quarter)
    prev_quarter_label = {"1": "1-3月", "2": "4-6月", "3": "7-9月", "4": "10-12月"}.get(prev_quarter, prev_quarter)

    today = datetime.now().strftime("%Y年%m月%d日")
    issue_num = (int(year) - 2025) * 4 + int(quarter)

    # 季節コラム
    col_title, col_body = QUARTERLY_COLUMNS.get(quarter, QUARTERLY_COLUMNS["1"])

    # スポットライト（四半期番号でローテーション）
    spot_idx = (int(year) * 4 + int(quarter)) % len(AREA_SPOTLIGHTS)
    spot_code, spot_name, spot_desc = AREA_SPOTLIGHTS[spot_idx]

    spot_data_html = ""
    if spot_stats:
        spot_data_html = f"""
          <p style="color:#64748b;font-size:13px;margin:8px 0 0;line-height:1.6">
            直近取引データ（{year}年{quarter_label}）: <strong>{spot_stats['count']:,}件</strong>の取引、
            平均価格 <strong style="color:#d97706">{fmt_price(spot_stats['avg_price'])}</strong>
          </p>"""

    # 主要エリア相場テーブル（前期比付き）
    rows_html = ""
    for (area_name, stats), (_, prev_stats) in zip(area_data, prev_area_data):
        if stats:
            change_text, change_color = "", "#64748b"
            if prev_stats:
                change_text, change_color = fmt_change(stats["avg_price"], prev_stats["avg_price"])
            change_cell = f'<span style="color:{change_color};font-weight:bold">{change_text}</span>' if change_text else "—"
            rows_html += f"""
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:500;font-size:13px">{area_name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;font-size:13px">{stats['count']:,}件</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#d97706;font-size:13px">{fmt_price(stats['avg_price'])}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px">{change_cell}</td>
            </tr>
            """

    html = f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 24px;text-align:center">
        <h1 style="color:#f59e0b;font-size:20px;margin:0 0 4px">不動産相場ナビ — 数字は嘘をつかない</h1>
        <p style="color:#94a3b8;font-size:12px;margin:0">{today}配信 ｜ {year}年{quarter_label}号（Vol.{issue_num}）</p>
      </div>

      <div style="padding:24px">
        <!-- サマリー -->
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:0 0 20px">
          <p style="color:#92400e;font-size:13px;font-weight:bold;margin:0 0 4px">
            {year}年{quarter_label} 相場データが更新されました
          </p>
          <p style="color:#78716c;font-size:12px;margin:0">
            国交省「不動産情報ライブラリ」の最新取引データに基づく5大エリアの相場と前期比をお届けします。
          </p>
        </div>

        <!-- 主要エリア相場テーブル（メインコンテンツ） -->
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px;border-left:3px solid #f59e0b;padding-left:10px">
          主要エリア相場一覧
        </h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin:0 0 8px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8">エリア</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#94a3b8">取引件数</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#94a3b8">平均価格</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#94a3b8">前期比</th>
            </tr>
          </thead>
          <tbody>{rows_html}</tbody>
        </table>
        <p style="color:#94a3b8;font-size:11px;margin:0 0 24px">
          ※ 国交省「不動産情報ライブラリ」{year}年{quarter_label}データ。前期比は{prev_year}年{prev_quarter_label}との比較。
        </p>

        <!-- AI査定 CTA -->
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
          <p style="color:#1e293b;font-size:14px;font-weight:bold;margin:0 0 4px">
            お持ちの物件、今いくら？
          </p>
          <p style="color:#64748b;font-size:12px;margin:0 0 12px">
            AIが国交省データから推定価格を算出。無料・登録不要。
          </p>
          <a href="{SITE_URL}/estimate"
             style="display:inline-block;background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
            無料AI査定を試す
          </a>
        </div>

        <!-- 今期のコラム -->
        <h2 style="color:#1e293b;font-size:15px;margin:0 0 12px;border-left:3px solid #3b82f6;padding-left:10px">
          {col_title}
        </h2>
        <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 24px">
          {col_body}
        </p>

        <!-- エリアスポットライト -->
        <h2 style="color:#1e293b;font-size:15px;margin:0 0 8px;border-left:3px solid #8b5cf6;padding-left:10px">
          エリアスポットライト: {spot_name}
        </h2>
        <p style="color:#475569;font-size:13px;line-height:1.7;margin:0">
          {spot_desc}
        </p>
        {spot_data_html}
        <div style="margin:12px 0 24px">
          <a href="{SITE_URL}/search"
             style="color:#3b82f6;font-size:13px;text-decoration:none;font-weight:500">
            &rarr; {spot_name}の相場データを見る
          </a>
        </div>

        <div style="text-align:center;margin:0 0 24px">
          <a href="{SITE_URL}/search"
             style="display:inline-block;background:#f59e0b;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
            あなたのエリアの相場を調べる
          </a>
        </div>

        <!-- プレミアムプラン訴求 -->
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:12px;padding:20px;margin:0 0 20px">
          <p style="color:#f59e0b;font-size:14px;font-weight:bold;margin:0 0 8px;text-align:center">
            もっと詳しいデータが必要ですか？
          </p>
          <table style="width:100%;margin:0 0 12px">
            <tr>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">過去20年分の取引データ</td>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">CSV一括ダウンロード</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">トレンド分析グラフ</td>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">エリア比較レポート</td>
            </tr>
          </table>
          <div style="text-align:center">
            <a href="{SITE_URL}/pricing"
               style="display:inline-block;background:#f59e0b;color:#0f172a;padding:10px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px">
              14日間無料トライアル &rarr;
            </a>
          </div>
          <p style="color:#64748b;font-size:11px;margin:8px 0 0;text-align:center">
            月額2,980円〜 ｜ クレジットカード不要で開始
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:11px;margin:0 0 4px">
          次号は来四半期のデータ公開後に配信予定です
        </p>
        <p style="color:#94a3b8;font-size:11px;margin:0 0 8px">
          <a href="{SITE_URL}" style="color:#f59e0b;text-decoration:none">不動産相場ナビ</a> | ネクソラ不動産
        </p>
        <p style="color:#94a3b8;font-size:11px;margin:0">
          <a href="%%UNSUBSCRIBE_URL%%" style="color:#94a3b8">配信停止はこちら</a>
        </p>
      </div>
    </div>
    """
    return html


def send_email(to, subject, html, personalize=True):
    """Resend APIでメール送信"""
    import urllib.request
    if personalize:
        unsub_url = generate_unsubscribe_url(to)
        html = html.replace("%%UNSUBSCRIBE_URL%%", unsub_url)
    data = json.dumps({
        "from": FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "NexoraNewsletter/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("id")
    except Exception as e:
        log(f"  Send error to {to}: {e}")
        return None


def save_draft(subject, html):
    DRAFTS_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    draft_path = DRAFTS_DIR / f"draft_{ts}.json"
    draft = {
        "subject": subject,
        "html": html,
        "created_at": datetime.now().isoformat(),
        "sent": False,
    }
    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)
    log(f"ドラフト保存: {draft_path.name}")
    return draft_path


def get_latest_draft():
    if not DRAFTS_DIR.exists():
        return None, None
    files = sorted(DRAFTS_DIR.glob("draft_*.json"), reverse=True)
    for f in files:
        with open(f, "r", encoding="utf-8") as fp:
            draft = json.load(fp)
        if not draft.get("sent"):
            return f, draft
    return None, None


def mark_draft_sent(draft_path):
    with open(draft_path, "r", encoding="utf-8") as f:
        draft = json.load(f)
    draft["sent"] = True
    draft["sent_at"] = datetime.now().isoformat()
    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)


def cmd_generate():
    """ドラフト生成"""
    check_env()
    log("=== 季刊レポート ドラフト生成開始 ===")

    # 最新四半期データ取得
    year, quarter = get_latest_quarter()
    log(f"対象期間: {year}年 Q{quarter}")

    # 前四半期データ取得
    prev_year, prev_quarter = get_previous_quarter(year, quarter)
    log(f"比較期間: {prev_year}年 Q{prev_quarter}")

    area_data = []
    prev_area_data = []
    for code, name in AREAS:
        log(f"  {name} データ取得中...")
        stats = fetch_area_stats(code, year, quarter)
        area_data.append((name, stats))
        prev_stats = fetch_area_stats(code, prev_year, prev_quarter)
        prev_area_data.append((name, prev_stats))

    has_data = any(stats for _, stats in area_data)
    if not has_data:
        log("全エリアでデータ取得できず。ドラフト生成をスキップ。")
        return

    # キャッシュ保存（次回の前期比用）
    cache_data = {}
    for (name, stats), (code, _) in zip(area_data, AREAS):
        if stats:
            cache_data[code] = stats
    save_cache(year, quarter, cache_data)

    # スポットライトエリアのデータ取得
    spot_idx = (int(year) * 4 + int(quarter)) % len(AREA_SPOTLIGHTS)
    spot_code = AREA_SPOTLIGHTS[spot_idx][0]
    spot_stats = fetch_area_stats(spot_code, year, quarter)

    # レポート生成
    html = generate_report_html(area_data, prev_area_data, year, quarter, spot_stats)
    quarter_label = {"1": "1-3月", "2": "4-6月", "3": "7-9月", "4": "10-12月"}.get(quarter, quarter)
    subject = f"【季刊】不動産相場レポート {year}年{quarter_label}号"

    draft_path = save_draft(subject, html)

    # 承認リンク生成
    today_str = datetime.now().strftime("%Y-%m-%d")
    token = hmac.new(
        INTERNAL_API_SECRET.encode(),
        f"newsletter-approve:{today_str}".encode(),
        hashlib.sha256,
    ).hexdigest()
    approve_url = f"{SITE_URL}/api/newsletter-approve?token={token}&date={today_str}"

    # 管理者にプレビュー通知
    notify_html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#f59e0b;margin:0 0 16px">季刊レポート 配信承認</h2>
      <p>件名: <strong>{subject}</strong></p>
      <p>購読者数: <strong>{len(load_subscribers())}人</strong></p>
      <div style="text-align:center;margin:24px 0">
        <a href="{approve_url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:16px 48px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:18px">
          OK — 配信する
        </a>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px">有効期限: 7日間</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
      <p style="font-size:12px;color:#94a3b8">以下はレポートのプレビューです:</p>
      {html}
    </div>
    """
    result = send_email(ADMIN_EMAIL, f"[要承認] {subject}", notify_html, personalize=False)
    if result:
        log(f"管理者通知送信OK: {ADMIN_EMAIL}")
    else:
        log(f"管理者通知送信FAIL: {ADMIN_EMAIL}")

    log("=== ドラフト生成完了。--approve で配信 ===")


def cmd_approve():
    """最新ドラフトを全購読者に配信"""
    check_env()
    log("=== 承認済み配信開始 ===")

    draft_path, draft = get_latest_draft()
    if not draft:
        log("未送信のドラフトがありません")
        return

    subscribers = load_subscribers()
    if not subscribers:
        log("購読者が0人のためスキップ")
        return

    log(f"ドラフト: {draft_path.name}")
    log(f"件名: {draft['subject']}")
    log(f"購読者数: {len(subscribers)}")

    success = 0
    for email in subscribers:
        result = send_email(email, draft["subject"], draft["html"])
        if result:
            log(f"  OK: {email} (id={result})")
            success += 1
        else:
            log(f"  FAIL: {email}")

    mark_draft_sent(draft_path)
    log(f"=== 完了: {success}/{len(subscribers)} 通送信 ===")


def cmd_preview():
    draft_path, draft = get_latest_draft()
    if not draft:
        print("未送信のドラフトがありません")
        return
    print(f"ファイル: {draft_path.name}")
    print(f"件名:   {draft['subject']}")
    print(f"作成:   {draft['created_at']}")
    print(f"購読者: {len(load_subscribers())}人")
    print(f"\n配信するには: python send_quarterly.py --approve")


def cmd_list():
    if not DRAFTS_DIR.exists():
        print("ドラフトなし")
        return
    files = sorted(DRAFTS_DIR.glob("draft_*.json"), reverse=True)
    for f in files:
        with open(f, "r", encoding="utf-8") as fp:
            d = json.load(fp)
        status = "[送信済]" if d.get("sent") else "[未送信]"
        print(f"  {f.name}  {status}  {d['subject']}")


def main():
    args = sys.argv[1:]
    if "--approve" in args:
        cmd_approve()
    elif "--preview" in args:
        cmd_preview()
    elif "--list" in args:
        cmd_list()
    else:
        cmd_generate()


if __name__ == "__main__":
    main()
