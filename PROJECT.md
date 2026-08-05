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
public/
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
- 配置 TypeScript、Tailwind CSS 与 ESLint 基线

## 7. 当前页面

- `/`：首页，包含产品介绍、无功能搜索框和模拟统计卡片
- `/market`：饰品市场占位页
- `/players`：职业选手数据占位页
- `/news`：CS2 新闻占位页
- `/login`：账户功能占位页，不包含真实登录功能

## 8. 下一阶段计划

1. 定义饰品、平台报价和价格历史的 TypeScript 数据模型
2. 使用明确标注的本地模拟数据搭建饰品搜索结果页
3. 设计加载、空状态与错误状态
4. 确认真实数据源、更新频率与合规要求后接入服务端数据
5. 在数据层稳定后规划收藏、提醒与账户系统

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
- `public`：可直接公开访问的静态资源
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

## 14. 真实数据说明

在真实 API、数据库或经过验证的数据源接入前，任何模拟数据都不能描述为真实平台数据、实时数据或实际市场行情。首页当前显示的统计数字是前端布局用模拟展示数据，不代表 SkinRadar 已具备对应的数据覆盖与更新能力。
