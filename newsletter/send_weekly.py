#!/usr/bin/env python3
"""
週刊 不動産相場レポート — 承認制送信スクリプト

使い方:
  python send_weekly.py           → ドラフト生成（自動cron用）
  python send_weekly.py --approve → 最新ドラフトを全購読者に送信
  python send_weekly.py --preview → 最新ドラフトのサマリーをターミナル表示
  python send_weekly.py --list    → ドラフト一覧表示

PM2 cron: 毎週月曜 9:00（ドラフト生成のみ）

処理フロー:
1. subscribers.json から購読者リスト読み込み
2. 国交省API（不動産情報ライブラリ）から最新データ取得
3. HTMLレポート生成 → drafts/ に保存
4. 管理者にプレビュー通知メール送信
5. --approve 実行で全購読者に配信
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
LOG_FILE = SCRIPT_DIR / "send_weekly.log"

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "re_RjFayddS_PATYavSHzQgrUpVH3ZoSNsqD")
REINFOLIB_API_KEY = os.getenv("REINFOLIB_API_KEY", "358076db69594cbbb9b279f88f23e41a")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "c4d0067e90dbca89d5130d6d387a7f93ce955e1716875611837f47d403302860")
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


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


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
    # 最大4四半期さかのぼって利用可能なデータを探す
    for offset_months in [3, 6, 9, 12]:
        target = now - timedelta(days=offset_months * 30)
        year = target.year
        month = target.month
        quarter = (month - 1) // 3 + 1
        # 東京都(13)でプローブ
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
    # フォールバック
    target = now - timedelta(days=270)
    year = target.year
    quarter = (target.month - 1) // 3 + 1
    return str(year), str(quarter)


def fmt_price(yen):
    if yen >= 100_000_000:
        return f"{yen / 100_000_000:.1f}億円"
    man = yen // 10_000
    return f"{man:,}万円"


# ─── 週替わりコラム（26本×2ローテーション = 年間カバー） ───
WEEKLY_COLUMNS = [
    ("今が売り時？ 不動産売却のベストタイミング",
     "不動産の売却は「いつ売るか」で数百万円の差が出ます。一般的に、1〜3月は転勤・入学シーズンで購入需要が高まり、売り手に有利な時期です。逆に、お盆や年末年始は市場が停滞しがち。ご自身の物件が今いくらか、まずはAI査定で確認してみませんか？"),
    ("住宅ローン金利の動向をチェック",
     "日銀の利上げにより住宅ローン金利は上昇局面に入りました。変動金利も徐々に上がり始め、固定金利との差は縮小中。これから購入を検討するなら、金利動向を注視しつつ、まず物件相場を把握しておくことが重要です。"),
    ("中古マンション vs 新築、どちらがお得？",
     "首都圏の新築マンション平均価格は1億円を超え、中古との価格差が拡大しています。築10年以内の中古マンションなら、新築の6〜7割の価格で同等の住環境を得られるケースも。エリアごとの相場を比較してみましょう。"),
    ("知っておきたい 不動産取引の諸費用",
     "不動産の購入には物件価格の6〜10%の諸費用がかかります。仲介手数料（最大3%+6万円）、登記費用、住宅ローン事務手数料、火災保険料など。売却時も3〜5%程度の費用が発生します。資金計画は余裕を持って立てましょう。"),
    ("エリア選びで失敗しない3つのポイント",
     "不動産購入で後悔しないためのポイント: (1) 通勤・通学の実際の所要時間を確認 (2) ハザードマップで災害リスクをチェック (3) 将来の再開発・人口動態を調査。相場ナビで気になるエリアのデータを無料で確認できます。"),
    ("築年数と資産価値の関係",
     "一般的にマンションは築20年で新築時の50〜60%まで価格が下がりますが、立地が良ければ築30年でも値崩れしにくい物件もあります。一方、一戸建ては築20年で建物価値がほぼゼロに。ただし土地の価値は残ります。"),
    ("2026年の不動産市場トレンド",
     "都心部のマンション価格は高止まり、郊外はエリアによる二極化が鮮明に。テレワーク定着で千葉・埼玉の駅近物件に注目が集まる一方、バス便エリアは下落傾向。最新の取引データで、あなたのエリアの動向を確認しましょう。"),
    ("不動産投資 利回りの見方",
     "表面利回りだけで判断するのは危険です。管理費・修繕積立金・固定資産税・空室リスクを差し引いた「実質利回り」で比較しましょう。都心のワンルームで表面4〜5%、実質2〜3%が目安。地方物件は高利回りでも空室リスクに注意。"),
    ("住み替えを成功させるコツ",
     "住み替えは「売り先行」か「買い先行」かで戦略が変わります。売り先行なら資金計画が立てやすく、買い先行なら理想の物件をじっくり探せます。まずは現在の物件価格をAI査定で把握してから計画を立てましょう。"),
    ("マンションの管理状態で価値が変わる",
     "「マンションは管理を買え」という格言があります。修繕積立金の積立状況、大規模修繕の履歴、管理組合の運営状態は資産価値に直結します。中古マンション購入時は、重要事項調査報告書を必ず確認しましょう。"),
    ("相続した不動産、どうする？",
     "相続不動産は「売却」「賃貸」「自己利用」の3択。空き家のまま放置すると固定資産税が最大6倍になる特定空家に指定されるリスクも。まずは現在の市場価値を確認し、最適な選択肢を検討しましょう。"),
    ("リフォームで資産価値は上がる？",
     "キッチン・浴室のリフォームは費用対効果が高く、売却時にプラス評価されやすい部分です。一方、間取り変更は好みが分かれるため、投資に見合わないことも。売却前リフォームは「最低限の清潔感」に絞るのが鉄則です。"),
    ("タワーマンションの資産性を考える",
     "タワマンは眺望や共用施設が魅力ですが、修繕積立金は築15年以降に急上昇する傾向があります。高層階ほど資産価値を維持しやすい反面、低層階は周辺の板状マンションと競合。購入前に長期修繕計画を必ず確認しましょう。"),
    ("駅徒歩分数、何分までがセーフ？",
     "不動産の資産価値に最も影響するのが「駅距離」。徒歩7分以内は値崩れしにくく、10分を超えると下落リスクが高まります。バス便エリアは新築時の半額以下になるケースも。エリアごとの徒歩分数と価格の関係をチェックしましょう。"),
    ("固定資産税の仕組みと節税ポイント",
     "固定資産税は毎年1月1日時点の所有者に課税されます。新築住宅は3〜5年間の減額措置あり。住宅用地は更地の1/6に軽減。売却予定なら引渡日による按分計算も重要です。持ち家の税負担を正確に把握しておきましょう。"),
    ("再開発エリアは買い？ リスクと見極め方",
     "再開発が決まったエリアは値上がり期待がありますが、計画が遅延・縮小するリスクも。「都市計画決定済み」と「構想段階」では確度が全く違います。周辺で実際に起きている取引価格の推移をデータで確認するのが確実です。"),
    ("賃貸 vs 購入、結局どちらが得？",
     "「家賃は捨て金」とよく言われますが、購入には金利・修繕・固定資産税のコストがあります。一般に、同じエリアに10年以上住むなら購入が有利。ただし住宅ローン金利と物件の資産価値下落率次第。まずは今の相場を確認しましょう。"),
    ("ハザードマップで安全な物件を選ぶ",
     "近年の自然災害増加で、ハザードマップの重要性が高まっています。2020年の法改正で重要事項説明への記載が義務化。浸水想定区域や土砂災害警戒区域は資産価値にも影響。物件探しの第一歩はハザードマップの確認から。"),
    ("住宅ローン控除を最大限活用する",
     "住宅ローン控除は最大13年間、年末残高の0.7%が税額控除されます。2024年以降は省エネ基準適合が条件に。中古住宅は築年数の制限もあるため要確認。控除額は数百万円になるので、購入前にシミュレーションしておきましょう。"),
    ("不動産会社の選び方で結果が変わる",
     "仲介手数料の上限は法律で決まっていますが、サービスの質は会社によって大きく異なります。囲い込み（両手仲介狙い）をする会社は避けるべき。複数社に査定を依頼し、提案力と売却戦略を比較してから媒介契約を結びましょう。"),
    ("ペアローン・収入合算のメリットと注意点",
     "共働き世帯が増え、ペアローンや収入合算で購入する方が増えています。借入額が増えるメリットがある反面、離婚時に売却が難航するリスクも。片方の収入が減った場合のシミュレーションも忘れずに。"),
    ("マンションの階数で価格はどう変わる？",
     "一般に、マンションは3階上がるごとに坪単価が1〜2%上昇します。1階は防犯・日照の懸念で安め、最上階はプレミアムが付くことも。ただし、タワマンの中層階はコスパが良いとされ、リセールでも安定した需要があります。"),
    ("団体信用生命保険（団信）の選び方",
     "住宅ローンに付帯する団信は、死亡・高度障害時にローン残高がゼロになる保険です。がん特約や三大疾病保障を付けると金利が0.1〜0.3%上乗せ。保障内容と保険料を既存の生命保険と比較して、過不足なく選びましょう。"),
    ("確定申告で戻るお金 — 住宅取得の税制優遇まとめ",
     "住宅取得には住宅ローン控除のほか、すまい給付金（終了済み・中古は別制度あり）、贈与税の非課税特例など複数の税制優遇があります。申告を忘れると適用されないものばかり。購入後は初年度の確定申告を忘れずに。"),
    ("不動産価格指数の読み方",
     "国交省が毎月公表する「不動産価格指数」は、市場全体のトレンドを把握するのに最適です。マンションは2013年から約1.9倍に上昇。ただし、全国平均と自分のエリアは異なります。相場ナビで自分のエリアのデータを確認しましょう。"),
    ("オーバーローンに要注意",
     "物件価格以上を借り入れる「オーバーローン」は、売却時に残債が売却額を上回り身動きが取れなくなるリスクがあります。特にフルローン+諸費用ローンの場合は要注意。頭金は最低でも物件価格の1割を目安にしましょう。"),
]

# ─── エリアスポットライト ───
AREA_SPOTLIGHTS = [
    ("13101", "千代田区", "皇居を中心とした都心の中核。オフィス街でありながら番町・麹町の高級住宅地も。"),
    ("13102", "中央区", "銀座・日本橋・月島。再開発で湾岸エリアのタワマンが人気。"),
    ("13103", "港区", "六本木・赤坂・白金。外資系企業が多く国際色豊か。平均坪単価は都内トップクラス。"),
    ("13104", "新宿区", "新宿駅周辺の商業地と、落合・四谷の住宅地が共存。交通利便性は都内随一。"),
    ("13113", "渋谷区", "IT企業の集積地。代官山・恵比寿の住宅エリアは根強い人気。"),
    ("13116", "豊島区", "池袋駅周辺の再開発で注目度上昇中。目白・雑司が谷は閑静な住宅地。"),
    ("13123", "足立区", "北千住駅周辺の再開発で資産価値が上昇中。都心と比べ割安感あり。"),
    ("14100", "横浜市", "みなとみらい・関内の再開発に加え、東急沿線の住宅地も人気。"),
    ("27100", "大阪市", "梅田・なんばの再開発ラッシュ。万博効果で湾岸エリアにも注目。"),
    ("40130", "福岡市", "天神ビッグバン・博多コネクティッドで都市機能が進化中。人口増加率は政令市No.1。"),
    ("13109", "品川区", "リニア新幹線の始発駅として開発が加速。大崎・五反田のビジネス拠点と武蔵小山の住宅地が共存。"),
    ("13105", "文京区", "教育環境で知られ、ファミリー層に人気。茗荷谷・本郷は文教地区ならではの落ち着いた住環境。"),
    ("13110", "目黒区", "自由が丘・中目黒は商業と住宅のバランスが良く、若年層にも支持。価格は高めだがリセール安定。"),
    ("13111", "大田区", "蒲田・大森の下町エリアと田園調布の高級住宅地が共存。羽田空港至近の利便性も魅力。"),
    ("13112", "世田谷区", "23区最大の人口を誇るベッドタウン。三軒茶屋・下北沢の若者文化と閑静な住宅地が混在。"),
    ("13114", "中野区", "新宿至近の好立地。中野駅前再開発で街の雰囲気が一変。賃貸・分譲ともに需要旺盛。"),
    ("13106", "台東区", "上野・浅草の観光地と蔵前のリノベエリア。面積最小の区ながら投資需要が活発。"),
    ("13119", "板橋区", "東上線沿線で都心アクセス良好。大山駅周辺の再開発で注目度上昇中。割安感あり。"),
    ("13121", "葛飾区", "下町情緒が残るエリア。新小岩・金町は再開発で利便性向上。23区内では価格水準が低め。"),
    ("23100", "名古屋市", "リニア開業見込みで駅周辺が再開発ラッシュ。栄・伏見のマンション需要が堅調。"),
    ("11100", "さいたま市", "大宮・浦和は都心通勤圏の定番。教育環境の良さからファミリー層に人気。"),
    ("12100", "千葉市", "幕張新都心の発展が続く。海浜幕張駅周辺はオフィスとマンションが集積するコンパクトシティ。"),
    ("01100", "札幌市", "すすきの・大通の中心部と、円山・宮の森の高級住宅地。冬季五輪招致は見送りも都市開発は継続。"),
    ("04100", "仙台市", "東北の中核都市。青葉通・長町の再開発が進行中。学都としての需要もあり空室率が低い。"),
    ("34100", "広島市", "中四国最大の都市。駅前再開発でタワマン建設が活発化。路面電車沿線の利便性が魅力。"),
    ("26100", "京都市", "景観規制で高層化が制限され供給が少なく、中古マンションの希少価値が高い。投資需要も旺盛。"),
]


def get_weekly_content():
    """今週のコラムとスポットライトを週番号で選択"""
    week_num = datetime.now().isocalendar()[1]
    column = WEEKLY_COLUMNS[week_num % len(WEEKLY_COLUMNS)]
    spotlight = AREA_SPOTLIGHTS[week_num % len(AREA_SPOTLIGHTS)]
    return column, spotlight


def generate_unsubscribe_url(email):
    """購読者ごとのHMAC付き配信停止URLを生成"""
    token = hmac.new(
        INTERNAL_API_SECRET.encode(),
        f"newsletter-unsubscribe:{email}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return f"{SITE_URL}/api/newsletter-unsubscribe?email={email}&token={token}"


def generate_report_html(area_data, year, quarter):
    """HTMLメールのレポートを生成（週刊向け: コラム+スポットライト主体、相場データは参考欄）"""
    quarter_label = {
        "1": "1-3月", "2": "4-6月", "3": "7-9月", "4": "10-12月"
    }.get(quarter, quarter)

    today = datetime.now().strftime("%Y年%m月%d日")
    week_num = datetime.now().isocalendar()[1]
    column, spotlight = get_weekly_content()
    col_title, col_body = column
    spot_code, spot_name, spot_desc = spotlight

    # スポットライトエリアのデータを取得
    spot_stats = fetch_area_stats(spot_code, year, quarter)
    spot_data_html = ""
    if spot_stats:
        spot_data_html = f"""
          <p style="color:#64748b;font-size:13px;margin:8px 0 0;line-height:1.6">
            最新取引データ（{year}年{quarter_label}）: <strong>{spot_stats['count']:,}件</strong>の取引、
            平均価格 <strong style="color:#d97706">{fmt_price(spot_stats['avg_price'])}</strong>
          </p>"""

    # 主要エリア相場（コンパクト参考欄）
    rows_html = ""
    for area_name, stats in area_data:
        if stats:
            rows_html += f"""
            <tr>
              <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:500;font-size:13px">{area_name}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;font-size:13px">{stats['count']:,}件</td>
              <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#d97706;font-size:13px">{fmt_price(stats['avg_price'])}</td>
            </tr>
            """

    html = f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 24px;text-align:center">
        <h1 style="color:#f59e0b;font-size:20px;margin:0 0 4px">不動産相場ナビ 週刊レター</h1>
        <p style="color:#94a3b8;font-size:12px;margin:0">{today}配信 ｜ Vol.{week_num}</p>
      </div>

      <div style="padding:24px">
        <!-- 今週のコラム（メインコンテンツ） -->
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px;border-left:3px solid #f59e0b;padding-left:10px">
          📝 今週のコラム: {col_title}
        </h2>
        <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 20px">
          {col_body}
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

        <!-- エリアスポットライト -->
        <h2 style="color:#1e293b;font-size:15px;margin:0 0 8px;border-left:3px solid #3b82f6;padding-left:10px">
          📍 エリアスポットライト: {spot_name}
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

        <!-- 主要エリア相場（参考データ） -->
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 20px">
          <h3 style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px">
            📊 参考: 主要エリア直近相場（{year}年{quarter_label}）
          </h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr>
                <th style="padding:4px 12px;text-align:left;font-size:11px;color:#94a3b8">エリア</th>
                <th style="padding:4px 12px;text-align:right;font-size:11px;color:#94a3b8">件数</th>
                <th style="padding:4px 12px;text-align:right;font-size:11px;color:#94a3b8">平均</th>
              </tr>
            </thead>
            <tbody>{rows_html}</tbody>
          </table>
          <p style="color:#94a3b8;font-size:11px;margin:8px 0 0;text-align:center">
            ※ 国交省「不動産情報ライブラリ」に基づく四半期データ。次回更新は新四半期データ公開時。
          </p>
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
            🔓 もっと詳しいデータが必要ですか？
          </p>
          <table style="width:100%;margin:0 0 12px">
            <tr>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">✅ 過去20年分の取引データ</td>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">✅ CSV一括ダウンロード</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">✅ トレンド分析グラフ</td>
              <td style="color:#94a3b8;font-size:12px;padding:4px 0">✅ エリア比較レポート</td>
            </tr>
          </table>
          <div style="text-align:center">
            <a href="{SITE_URL}/pricing"
               style="display:inline-block;background:#f59e0b;color:#0f172a;padding:10px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px">
              14日間無料トライアル →
            </a>
          </div>
          <p style="color:#64748b;font-size:11px;margin:8px 0 0;text-align:center">
            月額2,980円〜 ｜ クレジットカード不要で開始
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
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
    """Resend APIでメール送信（personalize=Trueで配信停止URLを埋め込む）"""
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
    """ドラフトをファイルに保存"""
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
    """最新の未送信ドラフトを取得"""
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
    """ドラフトを送信済みにマーク"""
    with open(draft_path, "r", encoding="utf-8") as f:
        draft = json.load(f)
    draft["sent"] = True
    draft["sent_at"] = datetime.now().isoformat()
    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)


def cmd_generate():
    """ドラフト生成（cron用）"""
    log("=== 週刊レポート ドラフト生成開始 ===")

    # データ取得
    year, quarter = get_latest_quarter()
    log(f"対象期間: {year}年 Q{quarter}")

    area_data = []
    for code, name in AREAS:
        log(f"  {name} データ取得中...")
        stats = fetch_area_stats(code, year, quarter)
        area_data.append((name, stats))

    # データがあるエリアが0なら生成スキップ
    has_data = any(stats for _, stats in area_data)
    if not has_data:
        log("全エリアでデータ取得できず。ドラフト生成をスキップ。")
        return

    # レポート生成
    html = generate_report_html(area_data, year, quarter)
    subject = f"【週刊】不動産相場レポート {datetime.now().strftime('%m/%d')}号"

    # ドラフト保存
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
      <h2 style="color:#f59e0b;margin:0 0 16px">週刊レポート 配信承認</h2>
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
    """最新ドラフトの情報をターミナル表示"""
    draft_path, draft = get_latest_draft()
    if not draft:
        print("未送信のドラフトがありません")
        return

    print(f"ファイル: {draft_path.name}")
    print(f"件名:   {draft['subject']}")
    print(f"作成:   {draft['created_at']}")
    print(f"購読者: {len(load_subscribers())}人")
    print(f"\n配信するには: python send_weekly.py --approve")


def cmd_list():
    """ドラフト一覧表示"""
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
