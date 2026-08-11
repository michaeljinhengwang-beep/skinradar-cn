# SkinRadar CN 项目说明

## 1. 项目名称

SkinRadar CN

## 2. 产品定位

SkinRadar CN 是面向中国 CS2 用户的饰品数据平台。产品计划提供饰品搜索、多平台价格追踪、历史价格趋势、职业选手灵敏度与外设信息、CS2 新闻、收藏及价格提醒。

## 3. 目标用户

- 希望查询和比较 CS2 饰品信息的中国玩家
- 关注饰品价格变化与市场趋势的用户
- 希望查阅职业选手设置和外设信息的玩家
- 关注 CS2 新闻与赛事动态的用户

## 4. 当前技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Node.js 24 内置测试运行器
- Git
- Windows 开发环境

项目采用根目录 `app` 结构，不使用 `src` 目录。

## 5. 当前目录结构

```text
app/
  error.tsx
  icon.svg
  layout.tsx
  manifest.ts
  not-found.tsx
  page.tsx
  robots.ts
  sitemap.ts
  globals.css
  market/page.tsx
  market/[id]/page.tsx
  market/[id]/not-found.tsx
  players/page.tsx
  players/[id]/page.tsx
  players/[id]/not-found.tsx
  news/page.tsx
  news/[slug]/page.tsx
  news/[slug]/not-found.tsx
  login/page.tsx
components/
  home/
    DemoDataNotice.tsx
    DemoStats.tsx
    FeatureOverview.tsx
    FinalCallToAction.tsx
    HeroSection.tsx
    HomeNewsCard.tsx
    HomePlayerCard.tsx
    HomeSkinCard.tsx
    MarketPreview.tsx
    NewsPreview.tsx
    PlayerPreview.tsx
    StatCard.tsx
  layout/
    Navbar.tsx
    Footer.tsx
  market/
    MarketExplorer.tsx
    MarketFilters.tsx
    PlatformQuotes.tsx
    PriceChange.tsx
    PriceHistoryTable.tsx
    SkinCard.tsx
    SkinGrid.tsx
  players/
    PlayerExplorer.tsx
    PlayerFilters.tsx
    PlayerCard.tsx
    PlayerGrid.tsx
    PlayerSettings.tsx
    PlayerEquipment.tsx
    PlayerStatusBadge.tsx
  news/
    NewsExplorer.tsx
    NewsFilters.tsx
    NewsCard.tsx
    NewsGrid.tsx
    FeaturedNews.tsx
    NewsArticleContent.tsx
    NewsMetadata.tsx
    RelatedNews.tsx
data/
  mock-skins.ts
  mock-players.ts
  mock-news.ts
lib/
  cache/
    market-cache.ts
  home.ts
  site.ts
  market.ts
  market-validation.ts
  players.ts
  player-validation.ts
  news.ts
  news-validation.ts
  providers/
    errors.ts
    market-provider.ts
    market-listings-service.ts
    mock-market-provider.ts
    csfloat-market-provider.ts
    csfloat-market-name.ts
    csfloat-response.ts
    normalizers/market.ts
  repositories/
    memory-market-repository.ts
  services/
    market-data-service.ts
public/
tests/
  home.test.ts
  market.test.ts
  players.test.ts
  news.test.ts
  site.test.ts
  providers.test.ts
  market-repository.test.ts
types/
  market.ts
  player.ts
  news.ts
  data-provider.ts
  csfloat.ts
  market-repository.ts
PROJECT.md
package.json
tsconfig.json
eslint.config.mjs
next.config.ts
```

## 6. 已完成内容

- 建立基于 App Router 的全站根布局
- 建立统一的深色主题、字体和响应式页面容器
- 建立全站导航栏与页脚
- 建立由独立组件组合的首页展示
- 首页已整合市场、职业选手与新闻的轻量模拟预览和有效详情入口
- 首页演示统计直接取自三个本地 mock 数据数组长度，避免虚构业务规模
- 前端展示版已具备首页、目录与详情页之间的完整页面导航
- 建立市场、职业选手、新闻和登录占位页
- 建立市场页数据模型、本地模拟数据及客户端搜索、筛选和排序界面
- 建立饰品结果卡片、响应式结果网格及空结果状态
- 建立 10 个模拟饰品动态详情页、动态 metadata 与无效 ID 状态
- 建立模拟平台报价列表和模拟价格历史表格
- 建立市场查询纯函数、统一排序工具和模拟数据完整性验证
- 建立职业选手数据模型、12 条虚构模拟资料及目录搜索、筛选和排序界面
- 建立选手查询纯函数、数据完整性验证与自动化测试
- 完善选手目录的模拟准星代码和鼠标、键盘、鼠标垫、耳机、显示器信息展示
- 建立 12 个模拟选手动态详情页，使用 `generateStaticParams`、动态 metadata、自定义 `notFound` 及完整设置展示
- 建立 14 条虚构模拟新闻、新闻目录、模拟精选区及客户端搜索、筛选和排序界面
- 建立新闻查询纯函数、结构化数据验证和自动化测试
- 建立 14 个模拟新闻动态详情页，使用 `generateStaticParams`、动态 metadata、自定义 `notFound`、模拟正文、完整元信息和相关文章推荐
- 新闻目录卡片与模拟精选新闻均可进入对应详情页
- 建立基于 Node.js 内置测试运行器的无依赖自动化测试基线
- 配置 TypeScript、Tailwind CSS 与 ESLint 基线
- 建立集中站点配置、页面 metadata、sitemap、robots 和 Web App Manifest
- 建立全局 404、错误边界、环境变量模板和 Vercel 上线文档
- 建立 Market Data Provider、统一外部报价模型、Normalizer、Mock 适配器与 CSFloat 未联网骨架
- 依据官方文档建立 CSFloat 只读 listings HTTP client、运行时响应解析和 cents 价格处理
- 完成一次无 API key、`limit=1` 的 CSFloat 只读兼容性请求；当前环境返回 403，未获得 listing 数组
- 建立来源可追踪的市场报价安全降级结果，真实 Provider 失败时不会把 mock 标记为 CSFloat
- 建立 Market Repository 接口、Memory Repository、TTL freshness 与 stale cache 服务策略

## 7. 当前页面

- `/`：统一产品入口，包含模拟数据声明、功能概览、数据集统计，以及市场、选手和新闻轻量预览
- `/market`：使用明确标注的本地模拟数据演示饰品搜索、筛选和排序
- `/market/[id]`：展示单个模拟饰品的基础信息、模拟平台报价和模拟价格历史
- `/players`：使用明确标注的虚构本地资料演示选手搜索、筛选、排序、模拟准星及完整外设配置
- `/players/[id]`：通过静态参数生成展示单个虚构选手的完整游戏设置、模拟准星和外设配置
- `/news`：使用本地虚构内容演示新闻精选、搜索、分类、地区、标签筛选和排序
- `/news/[slug]`：静态生成单篇模拟新闻详情，展示虚构正文、元信息、标签、免责声明和相关文章
- `/login`：账户功能占位页，不包含真实登录功能

## 8. 下一阶段计划

1. 设计 persistent cache 与 scheduled sync 策略，但保持写入链路可审计
2. 选择数据库前确认部署运行时、数据保留和失效要求
3. 在安全配置 API key 的受控服务端环境继续验证 listings 响应兼容性
4. Provider、持久缓存与降级验证稳定后，再规划页面数据源切换
5. 不实现购买、出价、上架或其他交易写操作

## 9. 编码规范

- React 组件和组件文件使用 PascalCase
- 文件夹使用小写命名
- 路由页面放在 `app` 中
- 公共组件放在 `components` 中
- 尽量使用 Server Components
- 只有需要交互状态或浏览器 API 时才添加 `use client`
- 内部链接统一使用 `next/link`
- 避免使用 `any`，为组件 Props 和数据结构定义明确类型
- 避免重复 JSX，重复模式明确后再提取组件
- 不提前创建大量无用抽象
- 每次只实现一个边界清晰、可验证的功能
- 保持语义化 HTML，并为无可见文本的交互控件提供可访问名称
- 新页面需兼顾手机端布局，避免固定宽度导致横向溢出

## 10. 组件命名规范

- 组件使用描述职责的 PascalCase 名称，例如 `Navbar`、`HeroSection`
- Props 类型使用“组件名 + Props”，例如 `StatCardProps`
- 页面默认导出使用“业务名 + Page”，例如 `MarketPage`
- 避免 `Common`、`Utils` 等职责不明确的组件名称

## 11. 文件夹职责

- `app`：路由、根布局、页面及全局样式
- `components/home`：仅供首页组合使用的展示组件
- `components/layout`：跨页面共享的布局组件
- `components/market`：市场页交互、筛选与饰品结果展示组件
- `components/players`：选手目录筛选、状态管理与结果展示组件
- `components/news`：新闻精选区、目录筛选、状态管理与结果展示组件
- `data`：明确标注用途的本地模拟数据
- `lib`：不依赖 React 或浏览器 API 的站点配置、首页预览选择、市场、选手和新闻查询、排序与数据验证纯函数
- `lib/providers`：服务器端市场数据源选择、Provider 适配、错误边界和外部报价标准化纯逻辑
- `lib/cache`：服务器端缓存 TTL 配置和 freshness 纯函数
- `lib/repositories`：SkinRadar 内部标准化市场数据的存储接口实现；当前仅有内存版本
- `lib/services`：组合 Repository、Provider、缓存刷新和降级策略的应用服务
- `public`：可直接公开访问的静态资源
- `tests`：使用 Node.js 内置测试运行器执行的确定性自动化测试
- `types`：跨组件共享的业务数据模型与联合类型
- 项目根目录：工程配置、项目文档和依赖清单

## 12. Git 提交规范

- `feat: ` 新功能
- `fix: ` 修复问题
- `refactor: ` 不改变功能的代码重构
- `docs: ` 文档变更
- `chore: ` 工程配置或日常维护

每次提交应聚焦单一目的，提交前运行 `npm run lint` 和 `npm run build`。

## 13. 模拟数据规则

- 模拟数据只用于界面开发、状态演示和自动化测试
- 模拟数据必须在代码注释、界面文案或项目文档中明确标注
- 模拟价格、平台数量、更新频率、新闻、选手信息和账户状态不得用于业务结论
- 接入真实数据后，应删除或隔离生产路径中的模拟数据
- 市场页当前的饰品价格、涨跌幅、数量、平台报价和日期均为本地模拟值
- 选手页当前的昵称、姓名、战队、角色、参数和外设均为虚构本地模拟值，不代表真实职业选手或 HLTV 资料
- 选手页准星代码及全部外设型号均为虚构展示数据，不代表真实选手配置，也不构成外设购买建议
- 新闻页标题、摘要、作者、来源标签、日期和热度均为虚构展示数据，不代表 Valve、HLTV、战队、选手或新闻媒体发布的真实内容，不可作为事实引用
- 新闻详情页正文和相关文章推荐同样只使用本地虚构数据；推荐结果不代表真实媒体判断
- 首页统计、市场预览、选手预览和新闻预览均来自本地模拟数据；首页仅提供轻量内容，筛选与完整详情保留在对应模块

## 14. 真实数据说明

在真实 API、数据库或经过验证的数据源接入前，任何模拟数据都不能描述为真实平台数据、实时数据或实际市场行情。首页当前显示的统计数字直接来自本地 mock 数组长度，只代表演示数据集规模，不代表 SkinRadar 已具备对应的数据覆盖与更新能力。

Market Data Provider 架构已经建立，当前默认 Provider 和页面数据源仍为 `mock` / `mockSkins`。项目仅依据官方文档支持 CSFloat `GET /api/v1/listings` 只读请求，并对 `unknown` JSON 进行运行时解析后再经过 Normalizer；自动测试使用注入的假 `fetch`，不依赖真实网络。2026-08-11 曾执行一次无 API key 的 `GET https://csfloat.com/api/v1/listings?limit=1` 兼容性验证，当前请求环境返回 HTTP 403，未取得 listings 数组，因此 Phase 2 parser 尚未被真实 listing 完整验证，也没有据此放松校验。API secret 只能由服务器端环境变量读取，不得传入 Client Component。当前没有交易写操作，也尚未将真实数据接入生产页面；下一步设计服务端缓存与同步策略。

Market Repository 架构现已建立：Memory Repository 仅用于开发和架构验证，保存的是经过 Normalizer 的 SkinRadar 内部 listing，并通过 envelope 追踪 source、fetchedAt、expiresAt、stale 和 fallback。Service 支持 fresh cache、同步刷新、失败时保留 stale cache，以及无缓存时明确标记的 mock fallback。当前尚未接入数据库或 cron，生产 `/market` 仍直接使用 `mockSkins`；下一阶段设计 persistent cache 与 scheduled sync。

## 15. 自动化验证

- 市场查询与排序入口位于 `lib/market.ts`，负责 ID 查找、关键词搜索、组合筛选、饰品排序、平台报价排序和价格历史排序
- 模拟数据验证位于 `lib/market-validation.ts`，返回包含字段路径和具体原因的结构化错误列表
- 选手查询与排序入口位于 `lib/players.ts`，选手模拟数据验证位于 `lib/player-validation.ts`
- 新闻查询与排序入口位于 `lib/news.ts`，新闻模拟数据验证位于 `lib/news-validation.ts`
- 首页稳定预览选择入口位于 `lib/home.ts`，覆盖不同武器、战队和主要角色，并优先展示模拟精选新闻
- 运行 `npm run test` 执行 `tests/*.test.ts` 中的全部测试
- 市场测试覆盖有效与无效 ID、搜索、单项及组合筛选、空结果、全部排序方式、输入不可变性、报价与历史排序以及模拟数据完整性
- 选手测试覆盖 ID 查找、搜索、单项及组合筛选、空结果、全部排序方式、输入不可变性和模拟资料完整性
- 选手详情测试覆盖全部静态 ID、ID 唯一性及详情页所需字段完整性；生产构建验证 `generateStaticParams`、动态 metadata 和自定义 `notFound`
- 新闻测试覆盖 ID 与 slug 查找、中文和英文搜索、组合筛选、五种排序、精选结果、输入不可变性及模拟数据完整性
- 新闻详情测试覆盖全部静态 slug、详情字段、模拟正文验证、相关文章优先级、推荐稳定性和输入不可变性；生产构建验证动态 metadata 与自定义 `notFound`
- 首页测试覆盖 limit 边界、结果稳定性、输入不可变性、预览多样性、模拟精选优先级及详情标识有效性
- 站点测试覆盖 URL 回退、导航、sitemap、robots 和 manifest 的确定性行为
- Provider 测试覆盖选择规则、Mock 适配、CSFloat 缺少鉴权、错误脱敏、标准化不可变性、价格和货币处理
- 安全报价服务测试覆盖成功来源、限流/不可用降级、无效响应拒绝及 mock 来源标识
- Repository 测试覆盖内存隔离、TTL 边界、刷新、stale cache、fallback、无效响应保护和来源追踪
- 当前 Node.js 24 可直接运行 TypeScript 测试，因此使用内置 `node:test` 和 `node:assert/strict`，无需引入 Vitest、Jest、tsx 或 ts-node
- 尚未引入第三方测试框架，因为当前测试对象均为不依赖 DOM 的纯函数；浏览器交互测试应在明确工具和范围后单独规划
- 下一阶段开发前必须保持 `npm run test`、`npm run lint` 和 `npm run build` 全部通过
