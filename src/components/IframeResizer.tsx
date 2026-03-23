"use client";

import { useEffect } from "react";

export default function IframeResizer() {
  useEffect(() => {
    // iframe内でない場合は何もしない
    if (window.self === window.top) return;

    document.documentElement.classList.add("in-iframe");

    let lastHeight = 0;

    function sendHeight() {
      const doc = document.documentElement;
      const body = document.body;

      // html・bodyを一時的に縮小して真のコンテンツ高さを測定
      const origDocH = doc.style.height;
      const origBodyH = body.style.height;
      const origBodyMin = body.style.minHeight;

      doc.style.height = "0";
      body.style.height = "0";
      body.style.minHeight = "0";

      const h = body.scrollHeight;

      doc.style.height = origDocH;
      body.style.height = origBodyH;
      body.style.minHeight = origBodyMin;

      if (h !== lastHeight) {
        lastHeight = h;
        window.parent.postMessage({ type: "resize-iframe", height: h }, "*");
      }
    }

    // 初回送信
    sendHeight();

    // DOM変化検知
    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(sendHeight);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // ロード完了時
    window.addEventListener("load", sendHeight);

    // フォールバック：定期的にチェック
    const interval = setInterval(sendHeight, 300);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("load", sendHeight);
      clearInterval(interval);
    };
  }, []);

  return null;
}
