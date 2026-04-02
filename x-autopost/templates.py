"""
不動産相場ナビ X自動投稿テンプレート
投稿カテゴリ: morning（相場データ）/ noon（記事紹介）/ night（Tips・CTA）
"""

MORNING_TEMPLATES = [
    "東京23区のマンション平均価格は約6,800万円。\n\n区ごとの相場差は最大5倍以上。\nあなたのエリアの相場を無料でチェック👇\nhttps://market.next-aura.com/search",
    "2026年の不動産市場、知っておくべき3つの数字：\n\n・マンション平均価格: 前年比+3.2%\n・金利: 変動0.3%台〜\n・取引件数: 回復傾向\n\n詳細データはこちら👇\nhttps://market.next-aura.com",
    "大阪市のマンション坪単価ランキング：\n\n1位 北区（梅田）330〜450万円\n2位 中央区（心斎橋）300〜420万円\n3位 天王寺区 250〜350万円\n\n全エリアの相場を確認👇\nhttps://market.next-aura.com/search",
    "「このマンション、適正価格？」\n\nAI査定なら数秒で推定価格がわかります。\n国交省の実取引データを元に算出。\n\n無料・登録不要👇\nhttps://market.next-aura.com/estimate",
    "名古屋市のマンション相場：\n\n中区（栄）280〜400万円/坪\n東区（東桜）250〜350万円/坪\n千種区 200〜300万円/坪\n\nエリアの詳細データ👇\nhttps://market.next-aura.com/search",
    "福岡市が今アツい理由：\n\n・マンション価格は東京の約1/2\n・天神ビッグバンで再開発加速\n・利回りは東京より1〜2%高い\n\n福岡の相場を確認👇\nhttps://market.next-aura.com/blog/fukuoka-mansion-souba",
    "不動産の相場を調べる方法、いくつ知っていますか？\n\n1. 国交省データ（無料）\n2. レインズ（業者のみ）\n3. AI査定（無料）\n4. 公示地価\n5. 路線価\n\n最も手軽な方法👇\nhttps://market.next-aura.com/estimate",
    "首都圏の中古マンション、エリア別の特徴：\n\n東京23区: 高値安定\n横浜市: 駅近人気\n埼玉県: コスパ◎\n千葉県: 新築供給多\n\n各エリアの相場を比較👇\nhttps://market.next-aura.com/search",
    "マンション売却で損しないための3ステップ：\n\n① 相場を調べる（AI査定）\n② 複数社に査定依頼\n③ 高値で売れる時期を見極める\n\nまず相場チェック👇\nhttps://market.next-aura.com/estimate",
    "住宅ローン、変動 vs 固定どっちがいい？\n\n・変動金利: 0.3%台〜（低いが上昇リスク）\n・固定金利: 1.5%台〜（安定だが割高）\n\n詳しい比較記事👇\nhttps://market.next-aura.com/blog/jutaku-loan-kinri-hikaku-2026",
    "不動産取引データ500万件以上を無料で検索できるサービス、知ってますか？\n\n全47都道府県・20年分のデータを網羅。\n\n不動産相場ナビ👇\nhttps://market.next-aura.com",
    "マンション購入の初期費用、実は物件価格の6〜10%かかります。\n\n3,000万円の物件なら180〜300万円。\n\n内訳と節約術はこちら👇\nhttps://market.next-aura.com/blog/mansion-kounyu-shoki-hiyo",
]

NOON_TEMPLATES = [
    "【新着記事】\nAI不動産査定とは？無料で使えるサービスの仕組みと精度を徹底解説\nhttps://market.next-aura.com/blog/ai-fudousan-satei-muryou",
    "【新着記事】\n2026年の不動産は買い時？金利・相場・市場動向から徹底分析\nhttps://market.next-aura.com/blog/fudousan-kaeru-timing-2026",
    "【新着記事】\nマンションの相場・価格の調べ方完全版｜無料で使える6つの方法\nhttps://market.next-aura.com/blog/mansion-souba-kakaku-chosa",
    "【新着記事】\n不動産投資の利回り計算方法｜表面利回りと実質利回りの違い\nhttps://market.next-aura.com/blog/fudousan-toshi-rimawari",
    "【新着記事】\nマンション売り時はいつ？2026年の売却ベストタイミング\nhttps://market.next-aura.com/blog/mansion-uri-doki-2026",
    "【新着記事】\n土地の売値相場の調べ方5選｜損しないための価格チェック法\nhttps://market.next-aura.com/blog/tochi-urchi-souba",
    "【新着記事】\n不動産売買の仲介手数料はいくら？計算方法と値引き交渉術\nhttps://market.next-aura.com/blog/fudousan-baibai-tesuryo",
    "【新着記事】\n住宅ローン金利比較2026｜変動vs固定の選び方\nhttps://market.next-aura.com/blog/jutaku-loan-kinri-hikaku-2026",
    "【新着記事】\nマンション管理費・修繕積立金の相場と適正額を徹底解説\nhttps://market.next-aura.com/blog/mansion-kanri-hiyo-souba",
    "【新着記事】\n賃貸相場の調べ方｜家賃の適正価格を知る5つの方法\nhttps://market.next-aura.com/blog/chintai-souba-shiraberu",
    "【新着記事】\n一戸建ての相場を調べる方法まとめ\nhttps://market.next-aura.com/blog/kodate-souba-shiraberu",
    "【新着記事】\n不動産査定サイト比較2026｜無料で使えるおすすめ6選\nhttps://market.next-aura.com/blog/fudousan-satei-site-hikaku",
]

NIGHT_TEMPLATES = [
    "不動産の売却・購入で最初にやるべきこと。\n\nそれは「相場を知ること」です。\n\n500万件以上の取引データを無料で検索👇\nhttps://market.next-aura.com",
    "「相場を知らずに売ると損をする」\n\nこれは不動産業界の常識。\n知らないのは売主だけ、なんてことも。\n\nまずは無料でAI査定👇\nhttps://market.next-aura.com/estimate",
    "不動産データの民主化。\n\n不動産相場ナビは、これまで業者しかアクセスできなかった取引データを、誰でも無料で検索できるようにしたサービスです。\n\nhttps://market.next-aura.com",
    "マンションを売る前に、必ず近隣の取引事例を確認してください。\n\n同じマンション内でも、階数・向き・リフォーム状況で数百万円の差がつきます。\n\n取引事例を無料で検索👇\nhttps://market.next-aura.com/search",
    "不動産投資で大事なのは「利回り」の計算。\n\n表面利回りと実質利回り、ちゃんと区別できていますか？\n\n詳しく解説👇\nhttps://market.next-aura.com/blog/fudousan-toshi-rimawari",
    "引っ越しの日取り、気にしますか？\n\n大安・一粒万倍日・天赦日をまとめて確認できるカレンダーを無料公開中👇\nhttps://market.next-aura.com/lp/moving-date",
    "不動産のプロが使うデータを、あなたも使える時代。\n\n全47都道府県・20年分の取引データを無料で検索。\n\n不動産相場ナビ👇\nhttps://market.next-aura.com",
    "週刊 不動産相場レポート、始めました。\n\nエリア別の相場動向・注目データを毎週無料でお届けします。\n\n登録はトップページから👇\nhttps://market.next-aura.com",
    "「この物件、高くない？」\n\nそう思ったら、過去の取引事例と比較してみてください。\n\nデータが判断の根拠になります。\n\nhttps://market.next-aura.com/search",
    "マンション購入の初期費用、物件価格の6〜10%かかるって知ってました？\n\n3,000万円なら180〜300万円。\n事前に知っておくことが大事。\n\nhttps://market.next-aura.com/blog/mansion-kounyu-shoki-hiyo",
    "仲介手数料の上限は法律で決まっています。\n\n3,000万円の物件なら最大105.6万円。\n\n計算方法と値引き交渉のコツ👇\nhttps://market.next-aura.com/blog/fudousan-baibai-tesuryo",
    "不動産相場ナビのデータは、国土交通省の「不動産情報ライブラリ」に基づいています。\n\n公的データだから信頼性が高い。\n\nhttps://market.next-aura.com",
]

# ── 課金訴求テンプレート（朝・夜にランダムで混ぜる） ──
PREMIUM_TEMPLATES = [
    "不動産仲介業者が使うデータ、個人でも手に入ります。\n\n✅ 過去20年分の取引データ\n✅ CSV一括ダウンロード\n✅ トレンド分析グラフ\n\n14日間無料トライアル👇\nhttps://market.next-aura.com/pricing",
    "マンション売却の査定前に。\n\nプロが使う「エリア別取引データ」で適正価格を把握。\n過去20年・全国のデータをCSVで取得可能。\n\n14日間無料で試す👇\nhttps://market.next-aura.com/pricing",
    "不動産投資の物件分析に。\n\n・エリア別の平均利回りを算出\n・過去データからトレンドを分析\n・CSVでポートフォリオ管理\n\nスタンダードプラン 月額2,980円\n14日間無料👇\nhttps://market.next-aura.com/pricing",
    "不動産の相場レポート、1回980円で購入できます。\n\nサブスク不要。必要な時に必要なエリアだけ。\n国交省データに基づく信頼性の高いレポート。\n\nhttps://market.next-aura.com/search",
    "「データで判断する不動産投資」\n\n不動産相場ナビのプロプランなら：\n📊 カスタムレポート作成\n👥 チーム5名まで共有\n📈 20年分のトレンド分析\n\n詳細はこちら👇\nhttps://market.next-aura.com/pricing",
    "不動産会社の営業トークに流されない方法。\n\nそれは「自分でデータを見ること」。\n\n不動産相場ナビなら全国の取引事例を検索可能。\n有料プランでCSV取得・詳細分析も。\n\nhttps://market.next-aura.com/pricing",
]
