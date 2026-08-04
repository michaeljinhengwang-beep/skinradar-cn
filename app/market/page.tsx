export default function MarketPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
              SkinRadar
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">皮肤市场</h1>
          </div>

          <button className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-cyan-400 hover:text-cyan-300">
            去购物车
          </button>
        </div>

        <p className="mt-4 max-w-2xl text-zinc-400">
          浏览热门皮肤、筛选风格并快速下单。这里是皮肤内容的交易与发现中心。
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              name: '赛博炫光套装',
              price: '¥128',
              tag: '精选',
              desc: '适合电竞与未来感主题，适配多种模式场景。',
            },
            {
              name: '深海迷雾皮肤',
              price: '¥96',
              tag: '热门',
              desc: '带有低饱和度冷色系光影，适合沉浸式体验。',
            },
            {
              name: '晨光森林套装',
              price: '¥84',
              tag: '新上',
              desc: '柔和自然 tones，适合轻度展示和日常使用。',
            },
          ].map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {item.tag}
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">{item.name}</h2>
                </div>
                <span className="text-lg font-bold text-cyan-300">{item.price}</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-400">{item.desc}</p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-zinc-500">库存充足</span>
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300">
                  立即购买
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
