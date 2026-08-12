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
  api/internal/market-sync/route.ts
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
  config/
    market-data-freshness.ts
    market-sync-schedule.ts
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
    market-row-mapper.ts
    memory-market-repository.ts
    supabase-market-repository.ts
    supabase-market-sync-store.ts
  services/
    internal-market-sync-handler.ts
    market-data-service.ts
    market-sync-health.ts
    market-sync-service.ts
    market-sync-timeout.ts
  supabase/
    connectivity.ts
    database-adapter.ts
    development.ts
    market-sync-lock.ts
    sync-smoke-safety.ts
    write-smoke-safety.ts
    server.ts
    server-config.ts
    server-options.ts
public/
tests/
  home.test.ts
  market.test.ts
  players.test.ts
  news.test.ts
  site.test.ts
  providers.test.ts
  market-repository.test.ts
  market-persistence.test.ts
  internal-market-sync.test.ts
  market-sync-schedule.test.ts
  supabase-development.test.ts
  supabase-sync-smoke-safety.test.ts
  supabase-write-safety.test.ts
types/
  market.ts
  player.ts
  news.ts
  data-provider.ts
  csfloat.ts
  market-repository.ts
  market-database.ts
  market-sync.ts
  supabase-database.ts
supabase/
  migrations/
    20260811000000_create_market_tables.sql
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
- 完成认证后的 CSFloat `limit=1` 只读 Provider 全链路验证；真实响应 wrapper 为 `object.data`，Parser、Provider mapping 与 Normalizer 均通过
- 建立来源可追踪的市场报价安全降级结果，真实 Provider 失败时不会把 mock 标记为 CSFloat
- 建立 Market Repository 接口、Memory Repository、TTL freshness 与 stale cache 服务策略
- 建立 Supabase/Postgres 持久化 Repository adapter、数据库 row mapper、migration 与同步服务架构
- 接入官方 `@supabase/supabase-js` 的 server-only client 和数据库 adapter，并建立只读 connectivity check
- 新 Supabase 项目优先使用 `SUPABASE_SECRET_KEY`，同时保留 legacy `SUPABASE_SERVICE_ROLE_KEY` 兼容读取
- 为异常 `running` 同步增加默认 900 秒的 stale lock 标记失败与安全回收机制
- 完成 Supabase 开发数据库三表 connectivity、隔离写入及 Mock Provider 端到端同步验证，并精确清理全部 smoke-test 数据
- 建立受 `CRON_SECRET` Bearer 鉴权保护的内部 `POST /api/internal/market-sync` 入口
- 完成一次 localhost 受保护 Route 到开发 Supabase 的隔离同步验证，并精确清理 listing、sync run 与 cache state
- 建立 server-only scheduler 配置解析、默认 60 秒运行 deadline、Provider `AbortSignal` 和 `TIMEOUT` 脱敏映射
- 建立默认 1800 秒的 `fresh` / `stale` / `unknown` 市场数据状态纯逻辑
- 建立基于 `market_sync_runs` 的脱敏同步健康查询，可读取上次成功、上次失败、Provider、received、written 与 errorCode
- 内部同步默认关闭，Phase 11 仍仅允许 `mock` Provider；尚未启用 Vercel Cron、Supabase Cron 或真实 CSFloat 同步

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

1. 保持生产 `MARKET_SYNC_ENABLED=false`、`MARKET_SYNC_PROVIDER=mock`，不创建 active Cron
2. Phase 12 已完成认证后的 CSFloat Provider 只读验证；解除 Route allowlist 前仍需单独审计生产同步配置与失败策略
3. 真实 Provider 稳定后，在“受保护 GET trigger”与“支持 Bearer POST 的 scheduler”之间单独选型
4. 若需要高于每日一次的频率，再评估 Supabase Cron、HTTP 调用与 secret 管理边界
5. 持久化同步验证稳定后，再规划页面数据源切换；在此之前页面继续使用 mock

### Scheduled Sync Strategy（Phase 11）

- 当前调度状态为 `manual`，仓库不包含 active `vercel.json` Cron，也没有 Supabase pg_cron job。
- Vercel Cron 当前向生产路径发送 `GET`，并在配置 `CRON_SECRET` 时附带 `Authorization: Bearer <CRON_SECRET>`。现有内部同步 Route 只接受 `POST`，因此不能直接作为 Vercel Cron target；本阶段不会增加 GET 写入口。
- Vercel Hobby 当前最小频率为每天一次，且触发时间精度为目标小时范围。若未来需要更高频率，可评估 Supabase Cron；其底层使用 pg_cron，可运行 SQL、数据库函数或 HTTP 调用，但会增加数据库调度和 secret 管理复杂度。
- `MARKET_SYNC_MAX_RUN_SECONDS` 默认 60 秒，非法、非正数或超过 300 秒的值回退到 60。handler deadline 会终止等待并向 Provider 发送 `AbortSignal`；已取得 run 且能响应 abort 时记录 `failed/TIMEOUT`。数据库完全无响应时，HTTP 仍按 deadline 返回，遗留 lock 由现有 stale-lock 回收机制处理。
- `MARKET_DATA_STALE_AFTER_SECONDS` 默认 1800 秒。纯逻辑将最后成功同步时间分类为 `fresh`、`stale` 或 `unknown`，不会自动删除数据，也尚未接入 `/market`。
- `getMarketSyncHealth()` 通过 server-side store 查询 `market_sync_runs` 的最近成功与最近失败，返回 Provider、时间、received、written 和允许列表内的 errorCode；未知错误统一为 `UNKNOWN`，不返回 raw error 或 secret。
- 重复调用依赖数据库每 Provider 单一 `running` partial unique lock 防并发，并通过 `(provider, external_id)` upsert 保持 listing 幂等；顺序调用可以保留多条 sync run 历史，但不会复制同一 listing。

失败策略：

| 场景 | HTTP | sync run | 旧 listing |
| --- | ---: | --- | --- |
| `AUTH_REQUIRED` | 503 | `failed` + 脱敏 errorCode | 保留 |
| `RATE_LIMITED` | 503 | `failed` + 脱敏 errorCode | 保留 |
| `PROVIDER_UNAVAILABLE` | 503 | `failed` + 脱敏 errorCode | 保留 |
| `INVALID_RESPONSE` / `NORMALIZATION_ERROR` | 500 | `failed` + 脱敏 errorCode | 保留 |
| `SYNC_ALREADY_RUNNING` | 409 | 不创建第二条 run | 保留 |
| `TIMEOUT` | 504 | 可完成时为 `failed/TIMEOUT`；数据库卡死时由 stale lock 回收 | 保留 |
| 配置缺失或非法 | 503 | Service 启动前拒绝，不创建 run | 保留 |

生产启用仍必须同时满足正确 `CRON_SECRET`、显式 `MARKET_SYNC_ENABLED=true`、Provider allowlist、Supabase 配置和 Provider 配置。Phase 11 allowlist 只有 `mock`；`csfloat` 仍被禁止。

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
- `lib/repositories`：SkinRadar 内部标准化市场数据的存储接口实现；包含内存版本与注入式 Supabase adapter contract
- `lib/supabase`：仅服务器端 Supabase 配置解析；缺失配置不影响当前 mock 网站构建
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

Market Data Provider 架构已经建立，当前默认 Provider 和页面数据源仍为 `mock` / `mockSkins`。项目支持 CSFloat `GET /api/v1/listings` 只读请求，并对 `unknown` JSON 进行运行时解析后再经过 Normalizer；Parser 严格兼容 direct array 与真实确认的 `object.data` wrapper。2026-08-12 已使用服务器端本地密钥完成一次认证后的 `limit=1` 正式 Provider 全链路验证，wrapper Parser、listing Parser、Provider mapping、cents 转换与 Normalizer 均通过。该 live sample 与现有 `item_name` / `state` 必填及 `wear_name` / `float_value` nullable-or-missing 兼容规则没有冲突，未据此放松其他字段校验。验证未保存完整 response、listing 值或 seller / Steam 用户数据。API secret 只能由服务器端环境变量读取，不得传入 Client Component；当前没有交易写操作，也尚未将真实数据接入生产页面或自动同步。

Market Repository 架构现已建立：Memory Repository 仅用于开发和架构验证，保存的是经过 Normalizer 的 SkinRadar 内部 listing，并通过 envelope 追踪 source、fetchedAt、expiresAt、stale 和 fallback。Service 支持 fresh cache、同步刷新、失败时保留 stale cache，以及无缓存时明确标记的 mock fallback。持久化 adapter 与 Sync Service 已在开发 Supabase 上通过隔离 smoke test，但生产 `/market` 仍直接使用 `mockSkins`。

Persistent Market Repository 以 Supabase Postgres 为目标，migration 位于 `supabase/migrations`，必须由用户在开发项目 SQL Editor 手动执行。数据库只保存标准化 listing、cache state 和脱敏 sync run，不保存第三方 raw response、卖家资料或 secret；RLS 已启用，anon/authenticated 默认无表权限，仅服务器 secret/legacy service role 可操作。`market_listings` 使用 `(provider, external_id)` 唯一键，写入通过事务型 RPC upsert listings 与 cache metadata；金额存为 `NUMERIC(24,8)` 十进制主单位，读取 RPC 转为字符串以避免数据库金额先经过 JavaScript 浮点。官方 Supabase SDK client 已封装在 server-only DAL，优先读取 `SUPABASE_SECRET_KEY`，仅在缺失时兼容 legacy `SUPABASE_SERVICE_ROLE_KEY`，且关闭 auth session 持久化。

同步并发的最终保证仍是 `market_sync_runs` 每 Provider 仅允许一条 `running` 记录的部分唯一索引。`MARKET_SYNC_LOCK_TIMEOUT_SECONDS` 默认 900 秒；数据库事务会把超时任务标记为 `failed` 与 `STALE_SYNC_RECOVERED` 后创建新任务，不删除历史记录，active lock 或并发竞态则返回不可获取。开发 Supabase 已完成真实 connectivity、隔离写入和一次 Mock Provider 端到端同步验证。内部 route 仅接受 POST 和 Bearer `CRON_SECRET`，默认 `MARKET_SYNC_ENABLED=false`，Phase 9 仅允许 `MARKET_SYNC_PROVIDER=mock`；Cron 与 CSFloat 同步均未启用，生产页面仍使用 mock。

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
- 持久化测试覆盖新/旧密钥优先级、server client、row mapper、真实 SDK adapter、原子 upsert、只读 connectivity、Provider 隔离、sync run、stale lock、数据库唯一并发保护和 secret/raw 数据边界
- 内部同步入口测试覆盖 Bearer 鉴权、timing-safe comparison、安全配置门、mock-only Provider、HTTP 状态映射、no-store、响应脱敏和禁用状态零副作用
- 当前 Node.js 24 可直接运行 TypeScript 测试，因此使用内置 `node:test` 和 `node:assert/strict`，无需引入 Vitest、Jest、tsx 或 ts-node
- 尚未引入第三方测试框架，因为当前测试对象均为不依赖 DOM 的纯函数；浏览器交互测试应在明确工具和范围后单独规划
- 下一阶段开发前必须保持 `npm run test`、`npm run lint` 和 `npm run build` 全部通过
