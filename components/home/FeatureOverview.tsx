import Link from "next/link";

const features = [
  {
    number: "01",
    title: "饰品市场",
    description: "体验饰品搜索、分类筛选、模拟报价与价格历史展示。",
    href: "/market",
    linkLabel: "进入模拟市场",
  },
  {
    number: "02",
    title: "职业选手",
    description: "浏览虚构选手的灵敏度、模拟准星代码和中性外设配置。",
    href: "/players",
    linkLabel: "浏览模拟选手",
  },
  {
    number: "03",
    title: "CS2 新闻",
    description: "体验新闻分类、搜索筛选与本地模拟文章详情。",
    href: "/news",
    linkLabel: "阅读模拟新闻",
  },
];

export default function FeatureOverview() {
  return (
    <section
      aria-labelledby="feature-overview-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-orange-400">核心功能</p>
        <h2
          id="feature-overview-heading"
          className="mt-1 text-3xl font-bold text-white"
        >
          三个模块，一个清晰入口
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          首页只提供轻量预览，完整搜索、筛选与详情功能保留在对应演示模块中。
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.href}
            className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
          >
            <p className="font-mono text-sm font-semibold text-orange-400">
              {feature.number} · 演示模块
            </p>
            <h3 className="mt-4 text-xl font-bold text-white">{feature.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">
              {feature.description}
            </p>
            <Link
              href={feature.href}
              className="mt-6 inline-flex self-start text-sm font-semibold text-orange-300 underline decoration-orange-500/40 underline-offset-4 transition-colors hover:text-orange-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              {feature.linkLabel} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
