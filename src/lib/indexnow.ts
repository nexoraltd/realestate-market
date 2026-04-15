const INDEXNOW_KEY = "f108c8567c234976b2a60f96df78110e";
const SITE_HOST = "market.next-aura.com";

export async function pingIndexNow(urls: string[]) {
  if (!urls.length) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls.map((u) => u.startsWith("http") ? u : `https://${SITE_HOST}${u}`),
      }),
    });
  } catch {
    // silently fail
  }
}
