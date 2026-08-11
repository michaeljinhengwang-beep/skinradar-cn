# SkinRadar CN

SkinRadar CN 是面向中文 CS2 用户的前端产品展示项目，当前提供模拟饰品市场、虚构职业选手配置和本地模拟新闻的目录、筛选及详情体验。

## 当前状态

项目已形成可构建、可测试的 Next.js 前端展示版。全部饰品报价、价格历史、选手资料、外设配置和新闻内容均为本地模拟数据，不代表真实平台、职业选手、HLTV、Valve 或媒体信息，也不构成购买或投资建议。

当前版本没有接入真实 API、数据库、账户、收藏、价格提醒、购买、分析或广告功能，也不收集用户个人数据。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Node.js 内置测试运行器
- Git

## 已完成功能

- 统一首页及市场、选手、新闻模块入口
- 10 条模拟饰品目录、筛选、排序和静态详情页
- 12 名虚构选手目录、筛选、排序和静态详情页
- 14 篇模拟新闻目录、筛选、排序和静态详情页
- 全站 metadata、sitemap、robots、Web App Manifest 和品牌图标
- 全局 404、错误边界及未开放登录功能说明页
- 纯函数数据验证与自动化测试

## 目录概览

```text
app/          路由、布局、metadata 路由及全局状态页面
components/   首页、布局、市场、选手和新闻组件
data/         明确标注的本地模拟数据
lib/          查询、验证、首页选择和站点配置纯函数
public/       公共静态资源
tests/        Node.js 内置测试运行器测试
types/        TypeScript 业务模型
```

## 本地运行

推荐使用 Node.js 24，以便直接执行当前 TypeScript 测试。生产构建仍遵循 Next.js 和部署平台支持的 Node.js 版本。

```bash
npm install
npm run dev
```

开发服务器默认访问 `http://localhost:3000`。

## npm 命令

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run start
```

## 环境变量

复制 `.env.example` 为本地使用的 `.env.local`，按需设置：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MARKET_DATA_PROVIDER=mock
CSFLOAT_API_KEY=
```

未设置时会安全回退到 `http://localhost:3000`。Vercel 部署后应改为已确认的正式域名，并重新部署。不要把 API key、Token 或其他秘密放入 `NEXT_PUBLIC_` 变量；`.env.local` 不应提交 Git。

## 真实数据接入状态

当前线上页面仍直接使用明确标注的本地模拟数据，尚未启用生产真实市场数据。项目已准备 Market Data Provider 与 Normalizer，并依据官方文档支持 CSFloat active listings 的只读 GET client；`MARKET_DATA_PROVIDER` 默认且安全回退为 `mock`。`CSFLOAT_API_KEY` 仅可作为服务器 secret，不得添加 `NEXT_PUBLIC_` 前缀或提交真实值。当前没有购买、出价、上架、账户修改或其他交易操作，也不表示已经完成生产接入。

## 测试与构建

提交或部署前依次运行：

```bash
npm run lint
npm run test
npm run build
```

测试覆盖市场、选手、新闻、首页预览和站点 SEO 配置纯函数。生产构建会验证全部静态目录页、动态详情页及 metadata 路由。

构建完成后可运行：

```bash
npm run start
```

## 上传 GitHub

1. 在 GitHub 创建空仓库并选择合适的可见性。
2. 确认 `.env.local`、秘密和个人文件未被提交。
3. 本地运行 lint、test 和 build。
4. 按团队 Git 流程添加远程仓库、提交并推送代码。
5. 不要把模拟数据描述为真实业务数据。

本项目文档不写死尚未创建的仓库地址。

## 部署到 Vercel

1. 将代码推送到 GitHub。
2. 在 Vercel 中导入仓库，平台会自动识别 Next.js。
3. 在项目环境变量中设置 `NEXT_PUBLIC_SITE_URL`。
4. 执行首次部署并检查构建日志。
5. 绑定并确认正式域名。
6. 将正式域名回填到 `NEXT_PUBLIC_SITE_URL` 后重新部署。
7. 验证首页、详情页、404、`/sitemap.xml`、`/robots.txt` 和 `/manifest.webmanifest`。

完整上线前清单见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 当前限制

- 所有内容均为本地模拟数据，没有实时价格或官方数据来源。
- 登录、注册、收藏、提醒和购买均未实现。
- 没有数据库、远程 API、分析 SDK、广告、Cookie 或第三方脚本。
- 没有准备远程 Open Graph 分享图片或完整离线 PWA 能力。

## 后续计划

- 完成 GitHub 与 Vercel 首次部署
- 绑定正式域名并验证 SEO 输出
- 在获得许可与确认合规要求后设计真实数据接口
- 规划缓存、错误降级、隐私和数据更新策略

## 数据与商标声明

SkinRadar CN 是独立产品演示项目。CS2、Counter-Strike、Valve、HLTV 及其他可能提及的名称和商标归各自权利人所有。本项目不使用官方或第三方平台 Logo，不表示与其存在授权、合作或官方关联。当前模拟内容不可作为市场、赛事、选手或媒体事实引用。
