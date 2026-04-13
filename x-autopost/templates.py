"""
不動産相場ナビ X自動投稿テンプレート
コンセプト: 数字は嘘をつかない。不動産の常識を、データで検証する。
投稿カテゴリ: morning（データファクト）/ noon（記事紹介）/ night（Tips・CTA）/ premium（課金訴求）
"""

MORNING_TEMPLATES = [
    "【データで検証】東京23区のマンション、区ごとの価格差は最大5倍。\n\n「港区は高い」は常識。でも数字で見ると、同じ区内でも駅距離で2倍差がつく。\n\n常識より数字を見よう👇\nhttps://market.next-aura.com/search\n\n#不動産 #マンション #不動産相場",
    "【ファクトチェック】2026年の不動産市場：\n\n・マンション平均価格: 前年比+3.2%\n・変動金利: 0.3%台〜\n・取引件数: 回復傾向\n\n「バブル崩壊」論に数字は何を示しているか👇\nhttps://market.next-aura.com\n\n#不動産 #不動産投資 #2026",
    "【データが示す真実】「大阪は東京より安い」は本当か？\n\n梅田: 坪330〜450万\n心斎橋: 坪300〜420万\n天王寺: 坪250〜350万\n\n実は都心部の坪単価差は縮小傾向👇\nhttps://market.next-aura.com/search\n\n#大阪 #マンション #不動産相場",
    "「営業マンの査定額」vs「500万件のデータが示す価格」\n\nどちらを信じますか？\n\nAI査定は国交省の実取引データを統計処理。\n人間の主観が入らない。\n\n無料で試す👇\nhttps://market.next-aura.com/estimate\n\n#不動産査定 #AI査定 #不動産",
    "【通説を検証】「駅徒歩7分以内なら値崩れしない」\n\nデータで見ると：\n・徒歩5分以内: 築20年で-15%\n・徒歩10分超: 築20年で-40%\n\n通説はおおむね正しい。ただし例外あり👇\nhttps://market.next-aura.com/search\n\n#マンション #不動産 #資産価値",
    "【数字で見る福岡】\n\n・マンション価格は東京の約1/2\n・天神ビッグバンで坪単価+20%\n・投資利回りは東京より1〜2%高い\n\n「地方はダメ」は本当か？データは別の答えを示す👇\nhttps://market.next-aura.com/blog/fukuoka-mansion-souba\n\n#福岡 #マンション #不動産投資",
    "不動産の「適正価格」を知る方法は5つある。\n\n1. 国交省データ（最も客観的）\n2. レインズ（業者のみ）\n3. AI査定（数秒で結果）\n4. 公示地価（年1回更新）\n5. 路線価（相続税基準）\n\n全部使えるサービス👇\nhttps://market.next-aura.com/estimate\n\n#不動産査定 #不動産 #マイホーム",
    "【データ比較】首都圏マンション、エリア別の数学的特徴：\n\n東京23区: 標準偏差が大きい（格差大）\n横浜市: 駅距離との相関が最も強い\n埼玉: 価格/面積比が最も優秀\n\n数字で選ぶ👇\nhttps://market.next-aura.com/search\n\n#首都圏 #マンション #不動産",
    "「今が売り時」と言う営業マン。\n\nデータは何と言っているか？\n\n① 過去の取引データで相場を確認\n② 価格推移トレンドを分析\n③ 数字に基づいて判断\n\n営業トークより信頼できるもの👇\nhttps://market.next-aura.com/estimate\n\n#不動産売却 #不動産 #マンション売却",
    "【金利のファクト】変動 vs 固定\n\n変動0.3%台、固定1.5%台。\n3000万円借入で月額差は約15,000円。\n35年で約630万円の差。\n\nただし変動が0.5%上がるだけで差は半減する。\n\n数字でシミュレーション👇\nhttps://market.next-aura.com/tools/loan-simulator\n\n#住宅ローン #金利 #マイホーム",
    "「不動産は情報の非対称性が大きい」\n\nつまり、業者は知っていて買主は知らない。\n\n500万件の取引データを誰でも無料で見られるようにした。\n情報格差をゼロにする👇\nhttps://market.next-aura.com\n\n#不動産 #不動産相場 #情報格差",
    "【常識を疑え】「マンション購入の諸費用は物件価格の10%」\n\nデータで検証すると6〜8%が実態。\n10%は最大値を常識化した結果。\n\n正確な数字を知る👇\nhttps://market.next-aura.com/blog/mansion-kounyu-shoki-hiyo\n\n#マンション購入 #不動産 #諸費用",
]

NOON_TEMPLATES = [
    "【記事】\nマンションの固定資産税はいくら？計算方法と節税術【2026年版】\nhttps://market.next-aura.com/blog/koteishisan-zei-mansyon\n\n#固定資産税 #マンション #不動産",
    "【記事】\n不動産購入の流れを完全解説｜初めてでも失敗しない全ステップ【2026年版】\nhttps://market.next-aura.com/blog/fudousan-kounyu-nagare\n\n#不動産購入 #マイホーム #不動産",
    "【記事】\n不動産売却の流れ完全ガイド｜査定から引き渡しまでの全ステップ\nhttps://market.next-aura.com/blog/fudousan-baikyo-nagare\n\n#不動産売却 #マンション売却 #不動産",
    "【記事】\n不動産の価格交渉術｜プロが教える値引きを成功させる5つのコツ\nhttps://market.next-aura.com/blog/fudousan-kakaku-kosho-tips\n\n#価格交渉 #不動産 #マンション購入",
    "【記事】\n不動産の相続・贈与の税金と手続きを徹底解説｜2026年最新版\nhttps://market.next-aura.com/blog/fudousan-okurimono-sozoku\n\n#相続 #不動産 #贈与税",
    "【新着記事】\nAI不動産査定とは？無料で使えるサービスの仕組みと精度を徹底解説\nhttps://market.next-aura.com/blog/ai-fudousan-satei-muryou\n\n#不動産査定 #AI #不動産",
    "【新着記事】\n2026年の不動産は買い時？金利・相場・市場動向から徹底分析\nhttps://market.next-aura.com/blog/fudousan-kaeru-timing-2026\n\n#不動産 #マイホーム #住宅ローン",
    "【新着記事】\nマンションの相場・価格の調べ方完全版｜無料で使える6つの方法\nhttps://market.next-aura.com/blog/mansion-souba-kakaku-chosa\n\n#マンション #不動産相場 #相場調査",
    "【新着記事】\n不動産投資の利回り計算方法｜表面利回りと実質利回りの違い\nhttps://market.next-aura.com/blog/fudousan-toshi-rimawari\n\n#不動産投資 #利回り #投資",
    "【新着記事】\nマンション売り時はいつ？2026年の売却ベストタイミング\nhttps://market.next-aura.com/blog/mansion-uri-doki-2026\n\n#マンション売却 #不動産 #売り時",
    "【新着記事】\n土地の売値相場の調べ方5選｜損しないための価格チェック法\nhttps://market.next-aura.com/blog/tochi-urchi-souba\n\n#土地 #不動産 #土地売却",
    "【新着記事】\n不動産売買の仲介手数料はいくら？計算方法と値引き交渉術\nhttps://market.next-aura.com/blog/fudousan-baibai-tesuryo\n\n#不動産 #仲介手数料 #マンション",
    "【新着記事】\n住宅ローン金利比較2026｜変動vs固定の選び方\nhttps://market.next-aura.com/blog/jutaku-loan-kinri-hikaku-2026\n\n#住宅ローン #金利 #マイホーム",
    "【新着記事】\nマンション管理費・修繕積立金の相場と適正額を徹底解説\nhttps://market.next-aura.com/blog/mansion-kanri-hiyo-souba\n\n#マンション #管理費 #修繕積立金",
    "【新着記事】\n賃貸相場の調べ方｜家賃の適正価格を知る5つの方法\nhttps://market.next-aura.com/blog/chintai-souba-shiraberu\n\n#賃貸 #家賃 #不動産",
    "【新着記事】\n一戸建ての相場を調べる方法まとめ\nhttps://market.next-aura.com/blog/kodate-souba-shiraberu\n\n#一戸建て #不動産 #マイホーム",
    "【新着記事】\n不動産査定サイト比較2026｜無料で使えるおすすめ6選\nhttps://market.next-aura.com/blog/fudousan-satei-site-hikaku\n\n#不動産査定 #不動産 #無料査定",
    "【新着記事】\n不動産投資初心者ガイド｜失敗しない物件選び・利回り計算・リスク管理\nhttps://market.next-aura.com/blog/fudousan-toshi-shoshinsha-guide\n\n#不動産投資 #初心者 #利回り #投資",
    "【新着記事】\nマンション売却タイミングの見極め方2026｜相場・築年数・市況から判断する\nhttps://market.next-aura.com/blog/mansion-urikata-jiiki-hikaku\n\n#マンション売却 #売り時 #不動産相場",
    "【新着記事】\n住宅ローン比較2026｜固定vs変動・おすすめ銀行・借り換えのポイント\nhttps://market.next-aura.com/blog/jutaku-loan-hikaku-2026\n\n#住宅ローン #固定金利 #変動金利 #マイホーム",
]

NIGHT_TEMPLATES = [
    "不動産で最初にやるべきことは「数字を見ること」。\n\n営業マンの言葉でも、ネットの口コミでもなく、500万件の実取引データ。\n\n数字は嘘をつかない👇\nhttps://market.next-aura.com\n\n#不動産 #不動産相場 #データ活用",
    "「相場を知らずに売ると損をする」\n\nこれは唯一の不動産の真理。\n業者は知っていて、売主だけが知らない。\n\nデータで武装しよう👇\nhttps://market.next-aura.com/estimate\n\n#不動産売却 #不動産 #査定",
    "不動産データの民主化。\n\nこれまで業者しかアクセスできなかった取引データを、誰でも無料で見られるようにした。\n\n情報の非対称性をゼロにする👇\nhttps://market.next-aura.com\n\n#不動産 #情報格差 #データ",
    "「この物件お得ですよ」\n\nその根拠は？感覚？経験？\n\n過去の取引データと比較すれば、数字が答えを出してくれる。\n\n同じマンション内でも階数・向きで数百万円の差👇\nhttps://market.next-aura.com/search\n\n#マンション #不動産 #価格交渉",
    "【数学的に考える不動産投資】\n\n表面利回り5%でも、実質は2-3%。\nその差の正体は管理費・修繕積立・空室・税金。\n\n計算できない投資はギャンブル👇\nhttps://market.next-aura.com/blog/fudousan-toshi-rimawari\n\n#不動産投資 #利回り #投資",
    "引っ越しの日取り、気にしますか？\n\n大安・一粒万倍日・天赦日をまとめて確認できるカレンダーを無料公開中👇\nhttps://market.next-aura.com/lp/moving-date\n\n#引っ越し #大安 #マイホーム",
    "「不動産のプロ」が使うデータを、あなたも使える。\n\n違いは「データを見ているかどうか」だけ。\n\n全47都道府県・20年分👇\nhttps://market.next-aura.com\n\n#不動産 #不動産投資 #データ分析",
    "メルマガ登録者に「不動産データレポート」を配信中。\n\n相場のトレンド・注目エリア・金利動向を定期的にお届け。\n\n無料登録はこちら👇\nhttps://market.next-aura.com\n\n#不動産 #メルマガ #不動産相場",
    "「高い気がする」は根拠にならない。\n\n500万件のデータと比較して初めて「高い」か「安い」かがわかる。\n\n感覚を数字に変えよう👇\nhttps://market.next-aura.com/search\n\n#マンション #不動産相場 #適正価格",
    "仲介手数料の上限は法律で決まっている。\n\n3,000万円なら最大105.6万円。\nこれは交渉の余地がある。\n\n知っているかどうかで100万円変わる👇\nhttps://market.next-aura.com/blog/fudousan-baibai-tesuryo\n\n#仲介手数料 #不動産 #交渉術",
    "住宅ローン、月々の返済額をシミュレーションしてみた？\n\n「なんとなく大丈夫」は数学的に危険。\n返済比率25%以上は黄信号。\n\n無料で計算👇\nhttps://market.next-aura.com/tools/loan-simulator\n\n#住宅ローン #返済シミュレーション #マイホーム",
    "不動産相場ナビのデータソース = 国土交通省「不動産情報ライブラリ」。\n\n公的データ。恣意的な加工なし。\n数字そのものを見せる。\n\nhttps://market.next-aura.com\n\n#不動産 #国交省 #データ",
]

# ── 課金訴求テンプレート（朝・夜にランダムで混ぜる） ──
PREMIUM_TEMPLATES = [
    "不動産仲介業者が使うデータ、個人でも手に入ります。\n\n✅ 過去20年分の取引データ\n✅ CSV一括ダウンロード\n✅ トレンド分析グラフ\n\n14日間無料トライアル👇\nhttps://market.next-aura.com/pricing\n\n#不動産投資 #不動産 #データ分析",
    "マンション売却の査定前に。\n\nプロが使う「エリア別取引データ」で適正価格を把握。\n過去20年・全国のデータをCSVで取得可能。\n\n14日間無料で試す👇\nhttps://market.next-aura.com/pricing\n\n#マンション売却 #不動産査定 #不動産",
    "不動産投資の物件分析に。\n\n・エリア別の平均利回りを算出\n・過去データからトレンドを分析\n・CSVでポートフォリオ管理\n\nスタンダードプラン 月額2,980円\n14日間無料👇\nhttps://market.next-aura.com/pricing\n\n#不動産投資 #利回り #ポートフォリオ",
    "不動産の相場レポート、1回980円で購入できます。\n\nサブスク不要。必要な時に必要なエリアだけ。\n国交省データに基づく信頼性の高いレポート。\n\nhttps://market.next-aura.com/search\n\n#不動産 #相場レポート #不動産投資",
    "「データで判断する不動産投資」\n\n不動産相場ナビのプロプランなら：\n📊 カスタムレポート作成\n👥 チーム5名まで共有\n📈 20年分のトレンド分析\n\n詳細はこちら👇\nhttps://market.next-aura.com/pricing\n\n#不動産投資 #データ #不動産",
    "不動産会社の営業トークに流されない方法。\n\nそれは「自分でデータを見ること」。\n\n不動産相場ナビなら全国の取引事例を検索可能。\n有料プランでCSV取得・詳細分析も。\n\nhttps://market.next-aura.com/pricing\n\n#不動産 #マンション #相場調査",
]
