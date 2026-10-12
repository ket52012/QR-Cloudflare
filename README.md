<p align="center">
  <img src="https://img.shields.io/badge/在线二维码处理工具-0a84ff?style=for-the-badge&logo=qrcode&logoColor=white" alt="在线二维码处理工具" />
  <br/>
  <strong>免费、开源、好用的二维码处理工具。</strong>
  <br/>
  <sub>无需注册。无水印。无追踪。没有套路。</sub>
</p>

> 🌐 **项目说明**：本项目基于 [aixmbcom/qr-studio](https://github.com/aixmbcom/qr-studio)（原作者 [deadboy18](https://github.com/deadboy18)，MIT 协议）汉化并二次开发。v2 新增：合并收款码（含 5 套主题）、图片二维码、iOS 毛玻璃 UI、5 种二维码样式。v3：移除 ChromaCode；图片码改为填链接（不存储任何数据）。v4：图片码扫码进入图片展示页（/v，可跳过）。v5：图片码新增整蛊贴纸预置模板（/v?p=，实时渲染可打印）。

<p align="center">
  <a href="https://deadboy18.github.io/qr-studio">
    <img src="https://img.shields.io/badge/🔗_Live_Demo-06b6d4?style=for-the-badge" alt="在线演示" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="许可证" />
  &nbsp;
  <img src="https://img.shields.io/github/stars/deadboy18/qr-studio?style=for-the-badge&color=f59e0b" alt="Stars" />
  &nbsp;
  <img src="https://img.shields.io/badge/dependencies-1-8b5cf6?style=for-the-badge" alt="依赖数" />
</p>

---

## 在线二维码处理工具是什么？

一款专业级二维码处理工具，完全在浏览器中运行。支持 **12 种数据类型**（含 🇲🇾 DuitNow、🖼️ 图片码）、**微信+支付宝合并收款码**（5 套主题）、带 **DuitNow EMV 解析的完整二维码解析器**、**5 种二维码样式**、**实时预览**，可导出 **PNG 和 SVG**。

市面上大多数二维码生成器都是臃肿的 SaaS：基础功能收费、二维码上打水印、下载个 PNG 还要注册账号。这里一样都不做。

---

## 功能

### 标准模式
- **12 种数据类型** — 网址、文本、WiFi、邮件、电话、短信、WhatsApp、位置、日历事件、电子名片、🇲🇾 DuitNow、🖼️ 图片码
- **实时预览** — 输入即生成，无需点"生成"按钮
- **5 种二维码样式** — ⬛ 经典方块、🔳 圆角、⚫ 墨点、🔷 菱形、🌈 霓虹渐变（均经真机解码验证可扫）
- **完整自定义** — 前景/背景颜色、7 套预设、对比度警告

### 合并收款码
- **微信 + 支付宝二合一** — 上传两张收款码，物理合并为一张：微信扫走微信、支付宝扫走支付宝
- **5 套主题** — 默认 / 支付宝蓝 / 微信绿 / 中国红 / 深邃夜，下载的 PNG 自带主题背景
- **纯本地处理** — 解码校验与合并全在浏览器完成，图片不上传
- 参考 [PayQrcode](https://github.com/uxiaohan/PayQrcode) 的物理合并方案

### 图片码
- **填图片直链生成二维码** — 手机扫码后在展示页中直接查看图片（深色全屏展示，绕过图床防盗链）
- **可跳过展示页** — 勾选"直接使用原图链接"则二维码为原始图片链接
- **🎭 整蛊贴纸** — 预置 4 款整蛊车贴模板（共享奔驰/宝马/特斯拉/路虎）+ 自定义品牌（限 8 字）；选中后生成二维码（内容为 `/v?p=xxx`），贴纸预览实时渲染（含嵌入的二维码），一键"🖨️ 打印贴纸"（@media print 仅输出贴纸本体，宽 10cm 竖版，适合打印张贴）；对方扫码即在展示页看到同一张贴纸。贴纸由服务端实时渲染，**不存储任何图片文件**
- **不存储任何数据** — 本工具为纯在线处理，不上传、不保存任何图片与数据；展示页仅实时加载你填写的链接。有图床请用自己的图床，没有可自行搜索免费图床
- **中心 Logo** — 上传任意图片作为中心 Logo，自动留白
- **描边与外框** — 可调的静区和边框选项
- **节日模板** — 圣诞节、万圣节、新年、复活节、情人节、圣帕特里克节、生日边框
- **WiFi 信息展示** — 可选把 SSID、密码、加密方式直接印在导出图片上
- **可复制的编码数据** — 每种二维码类型都显示原始编码字符串（mailto:、tel:、geo: 等），附带复制按钮
- **180+ 国家区号** — 所有电话输入框都有带国旗 emoji 的国际区号下拉
- **输入校验** — 每个字段实时校验，错误提示清晰
- **分辨率控制** — 导出 256px、512px、1024px 或 2048px
- **SVG 导出** — 无限放大的矢量输出，适合印刷

### 🇲🇾 DuitNow 二维码生成器
- **EMV 二维码字符串构建** — 按 [PayNet QR 规范 v1.5](https://docs.developer.paynet.my/docs/duitNow-QR/integration/QR-generation-specification/merchant-presented-mode/qr-data-object) 生成结构有效的 DuitNow EMV 二维码
- **70 家收单机构** — PayNet 官方名录中的全部银行、电子钱包和支付机构下拉列表
- **自动 CRC-16** — 按 ISO/IEC 13239 计算校验和，已用 PayNet 规范中的 4 个示例验证
- **DuitNow 品牌输出** — 官方粉色边框 + "MALAYSIA NATIONAL QR" 横幅渲染
- **静态 / 动态切换** — 可重复使用（11）或一次性（12）二维码
- **MCC 行业类别** — 25+ 常用商户类别代码
- **附加数据字段** — 参考标签、终端号、账单号、门店标签

> ⚠️ **注意：** 生成的二维码 EMV 格式和 CRC 都正确，但**不会处理真实付款**——商户/二维码 ID 必须是通过 PayNet 在收单银行注册的真实 ID。适合开发者测试 EMV 解析器或学习 DuitNow 二维码结构。参考 [natsu90 的研究](https://github.com/natsu90/emvqr/issues/1)。

### 🇲🇾 解析二维码 — DuitNow 二维码解析
- **相机、文件、粘贴** — 通过相机、图片上传或剪贴板粘贴扫描二维码
- **DuitNow EMV 解码** — DuitNow 和 JomPAY 二维码逐字段完整解析
- **70 家收单机构查询** — 按收单机构 ID 识别银行/钱包（[PayNet 官方列表](https://docs.developer.paynet.my/docs/duitNow-QR/integration/QR-generation-specification/merchant-presented-mode/qr-data-object#acquirer-id-id-01)）
- **CRC-16 校验** — 校验和验证，显示 ✓ 有效 / ✕ 无效及不匹配时的预期值
- **300+ MCC 代码** — 人性化的商户类别中文标签
- **JomPAY 识别** — 识别 JomPAY 二维码（收单机构 898989）并显示账单机构代码
- **小费与手续费** — 解码 EMV ID 55、56、57
- **商户渠道解码** — 按 PayNet 表 3–5 把 3 字符字段（ID 62.11）解码为媒介类型、交易地点、商户在场情况
- **数据完整性检查** — 存在时显示 SHA-256 哈希（ID 82）
- **语言模板** — 显示备用语言的商户名称/城市（ID 64）
- **附加数据字段** — 账单号、手机号、门店标签、会员号、参考标签、客户标签、终端号、交易用途、消费者数据请求、商户税号、RRN（参考号1/参考号2）、地理坐标
- **22 种货币代码** — MYR、USD、SGD、THB、IDR、CNY、GBP、EUR、JPY、AUD、HKD、KRW 等
- **重新生成干净二维码** — 从解码数据重建可扫的 DuitNow 品牌二维码，打印尺寸可调（贴纸 → A4），商户名称和银行字号可调
- **二维码安全分析** — 标记可疑网址，警告开放 WiFi、加密货币地址和付款二维码

### 通用
- **深色 / 浅色主题** — 偏好自动保存
- **移动端优先的响应式** — 手机、平板、桌面都完美适配
- **分享 API** — 支持的设备上可调用系统分享
- **单个 HTML 文件** — 整个应用就是一个文件，无构建步骤、无框架、无 node_modules
- **隐私优先** — 全部在客户端运行，数据不离开你的浏览器；本站不存储任何图片与数据
- **彩蛋** — 👀 _好奇的话打开控制台看看_

---

## 快速开始

### 方式一：直接用
访问 **[deadboy18.github.io/qr-studio](https://deadboy18.github.io/qr-studio)** —— 就这么简单。

### 方式二：自己托管
```bash
git clone https://github.com/aixmbcom/qr-studio.git
cd qr-studio
# 用任意浏览器打开 index.html。搞定。
```

无需安装依赖。无需构建。无需配置。

```
qr-studio/
├── index.html     ← 整个应用（单个文件）
├── worker.js      ← CORS 图片代理的 Cloudflare Worker（可选）
├── README.md
└── LICENSE
```

### 方式三：部署到 GitHub Pages
1. Fork 本仓库
2. 进入 **Settings → Pages**
3. **Source** 选择 `main` 分支和 `/ (root)` 目录
4. 点击 **Save**
5. 你的在线二维码处理工具就上线了：`https://<你的用户名>.github.io/QR-Cloudflare`

---

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| **页面与逻辑** | 原生 HTML、CSS、JavaScript |
| **二维码引擎** | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (1.4.4) |
| **二维码扫描** | [jsQR](https://github.com/cozmo/jsQR) (1.4.0，懒加载) |
| **DuitNow EMV 规范** | [PayNet QR 规范 v1.5](https://docs.developer.paynet.my/docs/duitNow-QR/integration/QR-generation-specification/merchant-presented-mode/qr-data-object) |
| **DuitNow 研究** | [natsu90](https://github.com/natsu90/duitnowqr-test) |
| **字体** | DM Sans + JetBrains Mono (Google Fonts) |
| **构建系统** | 无，就是一个文件 |
| **后端** | 无，纯客户端 |
| **CORS 代理** | [Cloudflare Worker](https://workers.cloudflare.com)（图片代理，可选） |
| **追踪** | 无，我们尊重你的隐私 |

---

## 支持的二维码类型

| 类型 | 编码格式 | 示例 |
|------|---------------|---------|
| **网址** | `https://example.com` | 网站链接 |
| **文本** | 纯文本 | 消息、备忘 |
| **WiFi** | `WIFI:T:WPA;S:MyNet;P:pass123;;` | 自动连接网络 |
| **邮件** | `mailto:hi@example.com?subject=...` | 预填邮件 |
| **电话** | `tel:+15551234567` | 点击拨号 |
| **短信** | `sms:+15551234567?body=...` | 预填短信 |
| **WhatsApp** | `https://wa.me/15551234567?text=...` | WhatsApp 直聊 |
| **位置** | `geo:48.8584,2.2945` | 地图与坐标 |
| **日历** | iCalendar (`.ics`) 格式 | 带时间、地点的事件 |
| **vCard** | vCard 3.0 格式 | 完整电子名片 |
| **🇲🇾 DuitNow** | EMV QR (TLV) 格式 | DuitNow 付款二维码 |

---

## 参与贡献

欢迎贡献！有新功能想法、发现 bug，或想改进代码：

1. Fork 本仓库
2. 新建功能分支（`git checkout -b feature/amazing-thing`）
3. 提交修改（`git commit -m 'Add amazing thing'`）
4. Push 到分支（`git push origin feature/amazing-thing`）
5. 发起 Pull Request

整个应用就是一个 HTML 文件，贡献代码跟改一个文件一样简单——没有复杂的项目结构。

---

## 致谢

**原作者 [deadboy18](https://github.com/deadboy18)**


合并收款码物理合并方案：[uxiaohan/PayQrcode](https://github.com/uxiaohan/PayQrcode)

DuitNow EMV 研究：[natsu90](https://github.com/natsu90/duitnowqr-test) · 收单机构数据来源：[PayNet QR 规范 v1.5](https://docs.developer.paynet.my/docs/duitNow-QR/integration/QR-generation-specification/merchant-presented-mode/qr-data-object) · [PayNet 开发者文档](https://docs.developer.paynet.my/docs)

特别感谢 [VenimK](https://github.com/VenimK) ❤️

---

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

<p align="center">
  <sub>如果这个工具帮你省下了每月 $15 的二维码生成器订阅费，欢迎给它点个 ⭐</sub>
</p>
