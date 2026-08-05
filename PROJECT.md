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
  layout.tsx
  page.tsx
  globals.css
  market/page.tsx
  market/[id]/page.tsx
  market/[id]/not-found.tsx
  players/page.tsx
  news/page.tsx
  login/page.tsx
components/
  home/
    HeroSection.tsx
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
data/
  mock-skins.ts
  mock-players.ts
lib/
  market.ts
  market-validation.ts
  players.ts
  player-validation.ts
public/
tests/
  market.test.ts
  players.test.ts
types/
  market.ts
  player.ts
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
- 建立市场、职业选手、新闻和登录占位页
- 建立市场页数据模型、本地模拟数据及客户端搜索、筛选和排序界面
- 建立饰品结果卡片、响应式结果网格及空结果状态
- 建立 10 个模拟饰品动态详情页、动态 metadata 与无效 ID 状态
- 建立模拟平台报价列表和模拟价格历史表格
- 建立市场查询纯函数、统一排序工具和模拟数据完整性验证
- 建立职业选手数据模型、12 条虚构模拟资料及目录搜索、筛选和排序界面
- 建立选手查询纯函数、数据完整性验证与自动化测试
- 建立基于 Node.js 内置测试运行器的无依赖自动化测试基线
- 配置 TypeScript、Tailwind CSS 与 ESLint 基线

## 7. 当前页面

- `/`：首页，包含产品介绍、无功能搜索框和模拟统计卡片
- `/market`：使用明确标注的本地模拟数据演示饰品搜索、筛选和排序
- `/market/[id]`：展示单个模拟饰品的基础信息、模拟平台报价和模拟价格历史
- `/players`：使用明确标注的虚构本地资料演示选手搜索、筛选和排序
- `/news`：CS2 新闻占位页
- `/login`：账户功能占位页，不包含真实登录功能

## 8. 下一阶段计划

1. 设计市场数据加载状态与非 404 错误状态
2. 建立仅使用本地模拟数据的选手详情页
3. 为市场和选手筛选交互规划浏览器级回归测试
4. 确认真实数据源、更新频率与合规要求后定义服务端数据接口
5. 为真实数据接入规划缓存、重试和降级策略

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
- `data`：明确标注用途的本地模拟数据
- `lib`：不依赖 React 或浏览器 API 的市场和选手查询、排序与数据验证纯函数
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

## 14. 真实数据说明

在真实 API、数据库或经过验证的数据源接入前，任何模拟数据都不能描述为真实平台数据、实时数据或实际市场行情。首页当前显示的统计数字是前端布局用模拟展示数据，不代表 SkinRadar 已具备对应的数据覆盖与更新能力。

## 15. 自动化验证

- 市场查询与排序入口位于 `lib/market.ts`，负责 ID 查找、关键词搜索、组合筛选、饰品排序、平台报价排序和价格历史排序
- 模拟数据验证位于 `lib/market-validation.ts`，返回包含字段路径和具体原因的结构化错误列表
- 选手查询与排序入口位于 `lib/players.ts`，选手模拟数据验证位于 `lib/player-validation.ts`
- 运行 `npm run test` 执行 `tests/*.test.ts` 中的全部测试
- 市场测试覆盖有效与无效 ID、搜索、单项及组合筛选、空结果、全部排序方式、输入不可变性、报价与历史排序以及模拟数据完整性
- 选手测试覆盖 ID 查找、搜索、单项及组合筛选、空结果、全部排序方式、输入不可变性和模拟资料完整性
- 当前 Node.js 24 可直接运行 TypeScript 测试，因此使用内置 `node:test` 和 `node:assert/strict`，无需引入 Vitest、Jest、tsx 或 ts-node
- 尚未引入第三方测试框架，因为当前测试对象均为不依赖 DOM 的纯函数；浏览器交互测试应在明确工具和范围后单独规划
- 下一阶段开发前必须保持 `npm run test`、`npm run lint` 和 `npm run build` 全部通过
