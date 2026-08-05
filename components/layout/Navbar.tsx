import Link from "next/link";

const navigationItems = [
  { label: "首页", href: "/" },
  { label: "市场", href: "/market" },
  { label: "职业选手", href: "/players" },
  { label: "新闻", href: "/news" },
];

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <nav
        aria-label="主导航"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
      >
        <Link
          href="/"
          className="shrink-0 text-xl font-bold text-white transition-colors hover:text-zinc-200 sm:text-2xl"
        >
          Skin<span className="text-orange-500">Radar</span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:order-none sm:w-auto sm:flex-nowrap sm:gap-6 lg:gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-white focus-visible:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:bg-orange-400"
        >
          登录
        </Link>
      </nav>
    </header>
  );
}
