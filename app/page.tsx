export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold">
            Skin<span className="text-orange-500">Radar</span>
          </h1>

          <div className="flex gap-6 text-sm text-zinc-300">
            <a href="#">首页</a>
            <a href="#">皮肤市场</a>
            <a href="#">价格趋势</a>
            <a href="#">职业选手</a>
            <a href="#">CS2 新闻</a>
          </div>

          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black">
            登录
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold text-orange-500">
          CS2 饰品数据平台
        </p>

        <h2 className="text-5xl font-bold leading-tight">
          更快发现值得关注的
          <br />
          CS2 饰品
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          查询饰品价格、历史趋势、市场数据，以及职业选手的灵敏度和外设配置。
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl">
          <input
            type="text"
            placeholder="搜索饰品，例如：AK-47 | 抽象派"
            className="flex-1 rounded-l-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none"
          />

          <button className="rounded-r-xl bg-orange-500 px-8 font-semibold text-black">
            搜索
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">追踪饰品</p>
          <p className="mt-2 text-3xl font-bold">10,000+</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">覆盖市场</p>
          <p className="mt-2 text-3xl font-bold">8 个</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">价格更新</p>
          <p className="mt-2 text-3xl font-bold">每日</p>
        </div>
      </section>
    </main>
  );
}