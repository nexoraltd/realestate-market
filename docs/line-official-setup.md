# LINE公式アカウント開設手順 — 不動産相場ナビ

## 1. アカウント開設

1. https://www.linebiz.com/jp/entry/ にアクセス
2. 「LINE公式アカウントを作成」をクリック
3. LINEアカウントまたはメールアドレスでログイン
4. アカウント情報を入力:
   - **アカウント名**: 不動産相場ナビ
   - **業種（大）**: 不動産
   - **業種（小）**: 不動産情報サービス
   - **会社名**: ネクソラ不動産（合同会社MI）

## 2. プロフィール設定

- **アイコン**: 不動産相場ナビのロゴ
- **ステータスメッセージ**: 数字は嘘をつかない。500万件のデータで不動産相場を検証
- **プロフィール画像**: X(@nexora_market)と同じものを使用

## 3. あいさつメッセージ設定

```
友だち追加ありがとうございます！

「不動産相場ナビ」は、国土交通省の500万件超の実取引データに基づく不動産相場情報サービスです。

毎週、エリア別の相場速報と注目データをお届けします。

【無料で使えるツール】
▶ AI不動産査定: https://market.next-aura.com/estimate
▶ 相場検索: https://market.next-aura.com/search
▶ 住宅ローンシミュレーター: https://market.next-aura.com/tools/loan-simulator
▶ 固定資産税シミュレーター: https://market.next-aura.com/tools/property-tax
```

## 4. リッチメニュー設定

6分割レイアウト:
| AI査定 | 相場検索 |
| ローン計算 | 固定資産税計算 |
| ブログ | 料金プラン |

各リンク:
- AI査定 → https://market.next-aura.com/estimate
- 相場検索 → https://market.next-aura.com/search
- ローン計算 → https://market.next-aura.com/tools/loan-simulator
- 固定資産税計算 → https://market.next-aura.com/tools/property-tax
- ブログ → https://market.next-aura.com/blog
- 料金プラン → https://market.next-aura.com/pricing

## 5. 友だち追加URLをサイトに設定

アカウント開設後、LINE Official Account Managerで「友だち追加」→「URLを作成」

取得したURL (例: `https://lin.ee/XXXXXXX`) から末尾のIDを取得。

Vercelの環境変数に設定:
```
NEXT_PUBLIC_LINE_ID=XXXXXXX
```

設定後、サイトのトップページ・ブログ記事に自動的にLINE友だち追加ボタンが表示される。

## 6. 週刊配信の設定

既存のメルマガ配信スクリプト (newsletter/send_weekly.py) を拡張するか、
LINE Messaging APIで同内容を配信する仕組みを追加。

### 料金プラン
- **コミュニケーションプラン（無料）**: 月200通まで
- **ライトプラン**: 月5,000円 / 5,000通
- 初期は無料プランで十分（友だち200人未満の間）
