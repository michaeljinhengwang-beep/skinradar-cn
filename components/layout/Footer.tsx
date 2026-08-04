import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-lg font-bold text-white">
            Skin<span className="text-orange-500">Radar</span>
          </Link>

          <p className="mt-2">
            CS2 饰品价格、市场趋势与职业选手数据平台。
          </p>
        </div>

        <div className="flex gap-6">
          <Link href="/market" className="transition hover:text-white">
            市场
          </Link>

          <Link href="/players" className="transition hover:text-white">
            职业选手
          </Link>

          <Link href="/news" className="transition hover:text-white">
            新闻
          </Link>
        </div>

        <p>© 2026 SkinRadar</p>
      </div>
    </footer>
  );
}
