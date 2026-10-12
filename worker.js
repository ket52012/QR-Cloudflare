// 在线二维码处理工具 — Cloudflare Worker
// 纯在线处理, 不存储任何数据
// 路由:
//   GET  /            → 前端页面(index.html 内嵌)
//   GET  /v?u=...     → 图片展示页(纯前端实时加载, 不存储)
//   GET  /?url=...    → CORS 图片代理

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── 图片展示页(纯前端, 不存储任何数据) ──
    if (path === '/v') return imageViewer(url.searchParams.get('u'));

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

// 图片展示页: 全屏居中显示图片, 深色背景; img 加 referrerpolicy 绕防盗链
function imageViewer(u) {
  const ok = u && /^https?:\/\//i.test(u);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = ok
    ? `<img class="view" src="${esc(u)}" referrerpolicy="no-referrer" alt="图片" onerror="showErr()">` +
      `<div class="err" id="err" style="display:none"><b>图片加载失败</b><br>请确认填写的是图片直链（http(s)://开头）</div>`
    : `<div class="err"><b>未指定图片地址</b><br>请在二维码工具中填写图片直链后重新生成</div>`;
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` +
    `<title>查看图片</title><style>` +
    `*{margin:0;padding:0;box-sizing:border-box}` +
    `body{background:#0b0b10;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:18px;` +
    `font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif}` +
    `img.view{max-width:100%;max-height:94vh;max-height:94dvh;border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,.65)}` +
    `.err{color:#9aa0b4;text-align:center;line-height:2.1;font-size:.95rem}` +
    `.err b{color:#fff;font-size:1.15rem;font-weight:700}` +
    `.brand{position:fixed;bottom:12px;left:0;right:0;text-align:center;color:#4a4e5e;font-size:.72rem;letter-spacing:1px}` +
    `</style></head><body>${body}` +
    `<div class="brand">在线二维码处理工具 · 纯在线展示，不存储任何数据</div>` +
    `<script>function showErr(){var i=document.querySelector("img.view");if(i)i.style.display="none";` +
    `var e=document.getElementById("err");if(e)e.style.display="block";}<\/script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
