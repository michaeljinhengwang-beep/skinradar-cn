import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-[0.3em] text-orange-500 uppercase">
          SkinRadar
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          未找到该选手
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          该模拟选手不存在，或当前本地虚构数据中没有对应记录。
        </p>
        <Link
          href="/players"
          className="mt-8 inline-flex rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          返回职业选手目录
        </Link>
      </div>
    </section>
  );
}
