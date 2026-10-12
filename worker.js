// 在线二维码处理工具 — Cloudflare Worker
// 纯在线处理, 不存储任何数据
// 路由:
//   GET  /            → 前端页面(index.html 内嵌)
//   GET  /?url=...    → CORS 图片代理

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── CORS 图片代理 ──
    const target = url.searchParams.get("url");
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (target) {
      let parsed;
      try { parsed = new URL(target); } catch {
        return Response.json({ error: "Invalid URL" }, { status: 400, headers: corsHeaders() });
      }
      if (!["http:", "https:"].includes(parsed.protocol))
        return Response.json({ error: "Invalid URL" }, { status: 400, headers: corsHeaders() });
      try {
        const resp = await fetch(target, {
          headers: { "User-Agent": "QRStudio-Favicon-Proxy/1.0", "Accept": "image/*,*/*;q=0.8" },
          redirect: "follow",
        });
        if (!resp.ok)
          return Response.json({ error: `Upstream returned ${resp.status}` }, { status: resp.status, headers: corsHeaders() });
        const ct = resp.headers.get("content-type") || "";
        if (!ct.includes("image") && !ct.includes("octet-stream") && !ct.includes("icon"))
          return Response.json({ error: "Not an image" }, { status: 415, headers: corsHeaders() });
        const body = await resp.arrayBuffer();
        return new Response(body, {
          status: 200,
          headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400", ...corsHeaders() },
        });
      } catch (err) {
        return Response.json({ error: "Fetch failed" }, { status: 502, headers: corsHeaders() });
      }
    }

    // ── 前端页面由构建脚本内嵌, 此处占位 ──
    return new Response("OK", { headers: { "content-type": "text/plain" } });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
