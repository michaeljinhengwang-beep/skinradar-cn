export default function DemoDataNotice() {
  return (
    <aside
      aria-labelledby="home-demo-notice-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6"
    >
      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 sm:p-6">
        <h2
          id="home-demo-notice-heading"
          className="font-semibold text-orange-200"
        >
          本站当前为模拟数据演示版本
        </h2>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-zinc-300">
          页面中的饰品、报价、选手配置和新闻均为本地虚构内容，不代表真实市场、职业选手、
          HLTV、Valve 或媒体信息，也不构成购买或投资建议。本版本主要用于产品界面与功能演示。
        </p>
      </div>
    </aside>
  );
}
