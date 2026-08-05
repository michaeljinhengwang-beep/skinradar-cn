export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="mb-4 text-sm font-semibold text-orange-500">
        CS2 饰品数据平台
      </p>

      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
        更快发现值得关注的
        <br />
        CS2 饰品
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
        查询饰品价格、历史趋势、市场数据，以及职业选手的灵敏度和外设配置。
      </p>

      <div className="mx-auto mt-10 flex w-full max-w-2xl">
        <input
          type="search"
          aria-label="搜索 CS2 饰品"
          placeholder="搜索饰品，例如：AK-47 | 抽象派"
          className="min-w-0 flex-1 rounded-l-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-orange-500 sm:px-5"
        />

        <button
          type="button"
          className="shrink-0 rounded-r-xl bg-orange-500 px-5 font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:bg-orange-400 sm:px-8"
        >
          搜索
        </button>
      </div>
    </section>
  );
}
