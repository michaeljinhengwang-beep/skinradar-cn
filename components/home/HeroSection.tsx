import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-400">
          面向中国 CS2 用户的产品演示
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          用 SkinRadar 探索饰品、
          <span className="text-orange-400">选手配置与 CS2 新闻</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          从一个入口浏览模拟饰品市场、虚构职业选手设置和本地模拟新闻，体验
          SkinRadar 的前端产品结构。
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          当前版本仅使用本地模拟数据，不代表真实价格、选手资料或媒体信息。
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/market"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            浏览皮肤市场
          </Link>
          <Link
            href="/players"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            查看职业选手
          </Link>
        </div>

        <Link
          href="/news"
          className="mt-5 inline-flex text-sm font-semibold text-orange-300 underline decoration-orange-500/40 underline-offset-4 transition-colors hover:text-orange-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          浏览 CS2 新闻 →
        </Link>
      </div>
    </section>
  );
}
