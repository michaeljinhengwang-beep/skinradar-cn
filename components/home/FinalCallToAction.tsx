import Link from "next/link";

export default function FinalCallToAction() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-zinc-900 to-zinc-950 p-7 sm:p-10">
        <p className="text-sm font-semibold text-orange-300">SkinRadar 演示版本</p>
        <h2 id="final-cta-heading" className="mt-2 max-w-2xl text-3xl font-bold text-white">
          从模拟市场开始探索完整产品流程
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300">
          当前阶段专注于稳定的前端体验。后续将在确认许可与合规要求后，逐步规划真实数据源接入；本页不承诺上线日期或实时价格能力。
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/market"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            进入皮肤市场
          </Link>
          <Link
            href="/news"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            查看项目新闻
          </Link>
        </div>
      </div>
    </section>
  );
}
