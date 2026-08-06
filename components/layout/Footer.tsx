import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-zinc-400 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="text-lg font-bold text-white transition-colors hover:text-zinc-200"
          >
            Skin<span className="text-orange-500">Radar</span>
          </Link>

          <p className="mt-2">
            CS2 饰品、选手配置与新闻的模拟数据产品演示。
          </p>
        </div>

        <nav aria-label="页脚导航" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/market" className="transition hover:text-white">
            市场
          </Link>

          <Link href="/players" className="transition hover:text-white">
            职业选手
          </Link>

          <Link href="/news" className="transition hover:text-white">
            新闻
          </Link>
        </nav>

        <p>© 2026 SkinRadar</p>
      </div>
    </footer>
  );
}
