// 在线二维码处理工具 — Cloudflare Worker
// 纯在线处理, 不存储任何数据
// 路由:
//   GET  /                  → 前端页面(index.html 内嵌)
//   GET  /v?u=...           → 图片展示页(纯前端实时加载, 不存储)
//   GET  /v?p=benz|bmw|tesla|landrover|custom&t=xx → 整蛊贴纸展示页(实时渲染, 不存储)
//   GET  /?url=...          → CORS 图片代理

// 整蛊贴纸预置: p → 品牌字
const STICKER_PRESETS = { benz: '奔驰', bmw: '宝马', tesla: '特斯拉', landrover: '路虎' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── /v: 整蛊贴纸(p 优先) / 图片展示页(纯前端, 不存储任何数据) ──
    if (path === '/v') {
      const p = url.searchParams.get('p');
      if (p) return stickerViewer(p, url.searchParams.get('t'));
      return imageViewer(url.searchParams.get('u'));
    }

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

// 整蛊贴纸展示页: 黄底黑字, 实时渲染, 不存储
// p: benz|bmw|tesla|landrover|custom ; custom 时 t=自定义品牌(限8字, 白名单过滤+XSS转义)
function stickerViewer(p, t) {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let brand = STICKER_PRESETS[p];
  if (p === 'custom') {
    // 白名单: 中文/字母/数字/空格, 截断 8 字
    brand = String(t == null ? '' : t).replace(/[^\u4e00-\u9fa5\uf900-\ufaffa-zA-Z0-9 ]/g, '').trim().slice(0, 8);
  }
  if (!brand) {
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>参数错误</title></head>` +
      `<body style="background:#1a1a20;color:#9aa0b4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;line-height:2">` +
      `<div><b style="color:#fff;font-size:1.2rem">贴纸参数无效</b><br>请在二维码工具中重新生成整蛊贴纸</div></body></html>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  const title = '共享' + brand;
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` +
    `<title>${esc(title)}</title><style>` +
    `*{margin:0;padding:0;box-sizing:border-box}` +
    `body{background:#1a1a20;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:22px;` +
    `font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif}` +
    `.sticker{background:#FFD900;border:10px solid #141414;border-radius:22px;width:min(340px,94vw);padding:28px 20px 0;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.55)}` +
    `.st-top{font-size:64px;font-weight:900;color:#141414;text-align:center;line-height:1.15;margin-bottom:20px;letter-spacing:2px}` +
    `.st-qr{background:#fff;border-radius:8px;width:fit-content;margin:0 auto 22px;padding:12px}` +
    `.st-qr canvas{display:block;width:190px;height:190px}` +
    `.st-bottom{background:#141414;color:#fff;text-align:center;font-size:32px;font-weight:800;letter-spacing:6px;padding:12px 0;margin:0 -20px}` +
    `.print-btn{border:none;border-radius:999px;padding:12px 34px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#5b8cff,#7a5cff);cursor:pointer;box-shadow:0 8px 24px rgba(91,140,255,.35)}` +
    `.brand{color:#4a4e5e;font-size:.72rem;letter-spacing:1px}` +
    `@media print{` +
    `body{background:#fff!important;padding:0!important;gap:0!important}` +
    `body>*{display:none!important}` +
    `.sticker{display:block!important;position:static!important;margin:0!important;box-shadow:none!important;width:10cm!important;border-width:.35cm!important;border-radius:.6cm!important;padding:.8cm .5cm 0!important}` +
    `.sticker .st-top{font-size:2.1cm!important;margin-bottom:.5cm!important}` +
    `.sticker .st-qr{padding:.3cm!important;margin:0 auto .6cm!important}` +
    `.sticker .st-qr canvas{width:4.6cm!important;height:4.6cm!important}` +
    `.sticker .st-bottom{font-size:1.05cm!important;letter-spacing:.2cm!important;padding:.3cm 0!important;margin:0 -.5cm!important}` +
    `}` +
    `</style></head><body>` +
    `<div class="sticker"><div class="st-top">${esc(title)}</div>` +
    `<div class="st-qr"><canvas id="qrc"></canvas></div>` +
    `<div class="st-bottom">扫码就能免费开</div></div>` +
    `<button class="print-btn" onclick="window.print()">🖨️ 打印贴纸</button>` +
    `<div class="brand">在线二维码处理工具 · 纯在线展示，不存储任何数据</div>` +
    `<script>__QRLIB_SRC__<\/script>` +
    `<script>(function(){try{var qr=qrcode(0,"M");qr.addData(location.href);qr.make();` +
    `var n=qr.getModuleCount(),cv=document.getElementById("qrc"),s=8;cv.width=cv.height=n*s;` +
    `var c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);c.fillStyle="#000";` +
    `for(var r=0;r<n;r++)for(var q=0;q<n;q++)if(qr.isDark(r,q))c.fillRect(q*s,r*s,s,s);}catch(e){}})();<\/script>` +
    `</body></html>`;
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
