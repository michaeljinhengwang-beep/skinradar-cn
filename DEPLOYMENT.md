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
- [ ] 已设置仅服务器使用的 `MARKET_SYNC_MAX_RUN_SECONDS=60`
- [ ] 已设置仅服务器使用的 `MARKET_DATA_STALE_AFTER_SECONDS=1800`
- [ ] 已为内部同步 route 单独设置 `CRON_SECRET`；不得与 CSFloat 或 Supabase secret 混用
- [ ] `CRON_SECRET` 未使用 `NEXT_PUBLIC_` 前缀，且未进入日志、响应或仓库
- [ ] 首次生产部署保持 `MARKET_SYNC_ENABLED=false`
- [ ] `MARKET_SYNC_PROVIDER=mock`；Phase 11 不允许通过内部 route 触发 CSFloat
- [ ] 尚未配置 Vercel Cron；启用 schedule 必须作为后续独立变更审核
- [ ] 仓库中没有 API key、Token、Cookie、个人信息或本地绝对路径
- [ ] 当前版本不加载分析、广告或第三方脚本

## Production Sync Safety Checklist

- [ ] `CRON_SECRET` 已设置为独立强 secret，且未进入代码、日志、响应或客户端 bundle
- [ ] 首次生产部署明确保持 `MARKET_SYNC_ENABLED=false`
- [ ] `MARKET_SYNC_PROVIDER=mock`，不允许 `csfloat`
- [ ] `MARKET_SYNC_MAX_RUN_SECONDS=60`
- [ ] `MARKET_SYNC_LOCK_TIMEOUT_SECONDS=900`
- [ ] `MARKET_DATA_STALE_AFTER_SECONDS=1800`
- [ ] Supabase 服务器配置完整，所有 key 均无 `NEXT_PUBLIC_` 前缀
- [ ] `/api/internal/market-sync` 仍只导出 `POST`，没有 GET 写入口
- [ ] 仓库根目录不存在包含 `crons` 的生产 `vercel.json`
- [ ] Supabase 未启用 pg_cron job、pg_net 调用或 Vault 调度 secret
- [ ] 真实 Provider 尚未完成认证与生产验证前，不启用任何 Cron

Vercel Cron 当前固定向配置路径发起生产环境 `GET` 请求；现有内部同步入口只允许 `POST`，因此两者不能直接连接。不要把现有 Route 加上 GET 写操作来临时兼容。未来必须单独评审一个受保护的 cron-compatible trigger，或选择明确支持带 Bearer header 的 POST scheduler。

Vercel Hobby 当前最多每天执行一次，且执行时间可能落在目标小时内的任意时刻。若未来需要更高频率，可单独评估 Supabase Cron（基于 pg_cron）；这会增加数据库调度、HTTP/函数调用和 secret 管理复杂度。本阶段不创建任何 Vercel 或 Supabase Cron 配置。

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
