import { createClient } from "microcms-js-sdk";

// microCMS client（遅延初期化）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> | null {
  if (!process.env.MICROCMS_API_KEY) return null;
  if (!_client) {
    _client = createClient({
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "nexora-realestate",
      apiKey: process.env.MICROCMS_API_KEY,
    });
  }
  return _client;
}

// サイト設定の型
export interface SiteSettings {
  siteName: string;
  catchcopy?: string;
  heroDescription?: string;
  contactEmail?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// デフォルト値（APIキー未設定時やフェッチ失敗時のフォールバック）
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "不動産相場ナビ",
  catchcopy: "マップで見る不動産相場データベース",
  heroDescription:
    "首都圏の不動産取引データをマップで直感的に検索。買いたい方も売りたい方も、相場を知ることが第一歩です。",
  contactEmail: "info@next-aura.com",
  ctaTitle: "売却をお考えですか？",
  ctaDescription:
    "相場データを確認したら、次は無料査定でより正確な価格をお確かめください。経験豊富なスタッフが丁寧にご対応いたします。",
  seoTitle: "不動産相場ナビとは",
  seoDescription:
    "不動産相場ナビは、国土交通省が公開している不動産取引価格情報を活用した、日本最大級の不動産相場データベースです。",
};

// サイト設定を取得
export async function getSiteSettings(): Promise<SiteSettings> {
  const client = getClient();
  if (!client) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const data = await client.getObject<SiteSettings>({
      endpoint: "site-settings",
    });

    // microCMSから取得したデータにデフォルト値をマージ
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...Object.fromEntries(
        Object.entries(data).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      ),
    };
  } catch (error) {
    console.warn("microCMS fetch failed, using defaults:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}
