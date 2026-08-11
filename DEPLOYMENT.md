# SkinRadar CN 上线前检查清单

## 代码与验证

- [ ] Git 工作树只包含计划上线的修改，并在部署提交后保持干净
- [ ] `npm run lint` 通过
- [ ] `npm run test` 通过
- [ ] `npm run build` 通过
- [ ] 生产模式启动后主要路由、详情页和 404 返回正确状态

## 环境变量与安全

- [ ] Vercel 已设置 `NEXT_PUBLIC_SITE_URL`
- [ ] 正式域名回填后已重新部署
- [ ] `.env.local` 未提交
- [ ] 启用持久化市场 Repository 前，服务器端已设置 `SUPABASE_URL` 与优先使用的 `SUPABASE_SECRET_KEY`
- [ ] `SUPABASE_SECRET_KEY` 未使用 `NEXT_PUBLIC_` 前缀，且未进入浏览器 bundle、日志或仓库
- [ ] 旧项目如暂用 `SUPABASE_SERVICE_ROLE_KEY`，已明确将其限制为 legacy compatibility
- [ ] 已设置仅服务器使用的 `MARKET_SYNC_LOCK_TIMEOUT_SECONDS`，默认建议 900 秒
- [ ] 未来启用内部同步 route 时，已单独设置 `CRON_SECRET`；不得与 CSFloat 或 Supabase secret 混用
- [ ] 仓库中没有 API key、Token、Cookie、个人信息或本地绝对路径
- [ ] 当前版本不加载分析、广告或第三方脚本

## GitHub 与 Vercel

- [ ] GitHub 仓库可见性符合项目计划
- [ ] 默认分支和部署分支已确认
- [ ] Vercel 已从正确仓库和分支导入
- [ ] 构建框架识别为 Next.js，未使用自定义构建绕过检查
- [ ] 正式域名 DNS 和 HTTPS 状态正常

## 上线内容

- [ ] 首页、市场、选手、新闻及详情页均明确标注模拟数据
- [ ] 登录页没有表单，也不收集邮箱或密码
- [ ] `/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest` 可访问
- [ ] 普通不存在路径显示全局 404
- [ ] 页面 title、description 和站点图标符合展示版定位

## 回滚

若部署出现问题，在 Vercel 项目部署记录中选择最近一次已验证成功的部署进行回滚；随后在本地修复问题、重新运行 lint、test 和 build，再创建新的部署。不要通过关闭 TypeScript、ESLint 或测试来恢复上线。
