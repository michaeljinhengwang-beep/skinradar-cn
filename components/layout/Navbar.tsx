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
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="text-2xl font-bold text-white">
          Skin<span className="text-orange-500">Radar</span>
        </Link>

        <div className="flex items-center gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-orange-400"
        >
          登录
        </Link>
      </nav>
    </header>
  );
}
