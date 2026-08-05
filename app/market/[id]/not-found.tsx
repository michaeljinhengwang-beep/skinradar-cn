import Link from "next/link";

export default function MarketItemNotFound() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
          SkinRadar
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          未找到该饰品
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          该模拟饰品不存在，或当前本地演示数据中没有对应记录。
        </p>
        <Link
          href="/market"
          className="mt-8 inline-flex rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          返回皮肤市场
        </Link>
      </div>
    </section>
  );
}
