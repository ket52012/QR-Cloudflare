// 在线二维码处理工具 — Cloudflare Worker
// 路由:
//   GET  /            → 前端页面(index.html 内嵌)
//   GET  /?url=...    → CORS 图片代理(供 ChromaCode 用)
//   POST /api/upload  → 上传图片到 R2, 返回 {id}
//   GET  /img/{id}    → 图片展示页(毛玻璃风)
//   GET  /i/{id}      → 图片原文件(供展示页引用)

const IMG_PAGE = (imgUrl) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>图片分享</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC",system-ui,sans-serif;
background:linear-gradient(135deg,#1c1c1e 0%,#2c2c2e 40%,#3a3a3c 70%,#1c1c1e 100%);background-attachment:fixed}
body::before{content:"";position:fixed;inset:0;background:
radial-gradient(600px 400px at 20% 10%,rgba(10,132,255,.25),transparent 60%),
radial-gradient(500px 500px at 85% 80%,rgba(94,92,230,.22),transparent 60%),
radial-gradient(400px 300px at 70% 20%,rgba(255,149,0,.12),transparent 60%);pointer-events:none}
.card{position:relative;max-width:560px;width:100%;background:rgba(255,255,255,.08);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.45)}
.card img{display:block;width:100%;height:auto;border-radius:16px;background:rgba(0,0,0,.2)}
.meta{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding:0 4px}
.meta a{color:rgba(255,255,255,.75);font-size:13px;text-decoration:none}
.meta span{color:rgba(255,255,255,.4);font-size:12px}
</style></head><body><div class="card"><img src="${imgUrl}" alt="分享图片"><div class="meta"><a href="https://qqr.633668.xyz" target="_blank">在线二维码处理工具</a><span>志远出品</span></div></div></body></html>`;

function rid(n) {
  const c = "0123456789abcdefghijklmnopqrstuvwxyz";
  let s = "";
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  for (let i = 0; i < n; i++) s += c[b[i] % 36];
  return s;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── 图片上传 ──
    if (path === "/api/upload" && request.method === "POST") {
      try {
        const ct = request.headers.get("content-type") || "";
        if (!ct.includes("multipart/form-data"))
          return Response.json({ error: "请使用 multipart/form-data 上传" }, { status: 400 });
        const form = await request.formData();
        const file = form.get("file");
        if (!file || typeof file === "string")
          return Response.json({ error: "未收到文件" }, { status: 400 });
        if (!file.type.startsWith("image/"))
          return Response.json({ error: "只允许上传图片" }, { status: 400 });
        if (file.size > 5 * 1024 * 1024)
          return Response.json({ error: "图片不能超过 5MB" }, { status: 400 });
        if (file.size === 0)
          return Response.json({ error: "空文件" }, { status: 400 });
        const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "png";
        const id = rid(10);
        const key = id + "." + ext;
        await env.IMG.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        return Response.json({ id: key });
      } catch (e) {
        return Response.json({ error: "上传失败" }, { status: 500 });
      }
    }
    if (path === "/api/upload")
      return Response.json({ error: "Method Not Allowed" }, { status: 405 });

    // ── 图片原文件 ──
    if (path.startsWith("/i/")) {
      const key = decodeURIComponent(path.slice(3)).replace(/[^a-zA-Z0-9._-]/g, "");
      if (!key) return new Response("Not Found", { status: 404 });
      const obj = await env.IMG.get(key);
      if (!obj) return new Response("Not Found", { status: 404 });
      return new Response(obj.body, {
        headers: {
          "content-type": obj.httpMetadata?.contentType || "image/png",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    // ── 图片展示页 ──
    if (path.startsWith("/img/")) {
      const key = decodeURIComponent(path.slice(5)).replace(/[^a-zA-Z0-9._-]/g, "");
      if (!key) return new Response("Not Found", { status: 404 });
      const obj = await env.IMG.head(key);
      if (!obj) return new Response("图片不存在或已删除", { status: 404 });
      return new Response(IMG_PAGE("/i/" + encodeURIComponent(key)), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // ── CORS 图片代理(供 ChromaCode 用) ──
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
