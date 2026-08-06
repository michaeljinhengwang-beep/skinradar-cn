import Link from "next/link";
import type { Skin } from "@/types/market";
import HomeSkinCard from "./HomeSkinCard";

interface MarketPreviewProps {
  skins: readonly Skin[];
}

export default function MarketPreview({ skins }: MarketPreviewProps) {
  return (
    <section
      aria-labelledby="market-preview-heading"
      className="border-y border-zinc-900 bg-zinc-950/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-400">市场预览</p>
            <h2 id="market-preview-heading" className="mt-1 text-3xl font-bold text-white">
              模拟饰品行情卡片
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              以下价格和涨跌均为固定本地演示值，不代表实时市场行情。
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex self-start text-sm font-semibold text-orange-300 underline decoration-orange-500/40 underline-offset-4 hover:text-orange-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:self-auto"
          >
            查看完整皮肤市场 →
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {skins.map((skin) => (
            <HomeSkinCard key={skin.id} skin={skin} />
          ))}
        </div>
      </div>
    </section>
  );
}
