import Link from "next/link";
import type { Skin } from "@/types/market";

interface HomeSkinCardProps {
  skin: Skin;
}

function formatPriceChange(value: number): string {
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `${value.toFixed(1)}%`;
  return "无变化 0.0%";
}

export default function HomeSkinCard({ skin }: HomeSkinCardProps) {
  const changeClassName =
    skin.priceChange24h > 0
      ? "text-emerald-300"
      : skin.priceChange24h < 0
        ? "text-rose-300"
        : "text-zinc-300";

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
      <div className="flex h-28 items-center justify-center border-b border-zinc-800 bg-zinc-950 px-4">
        <span className="break-words text-center text-xl font-bold text-zinc-700">
          {skin.weapon}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-semibold text-orange-300">
            模拟数据
          </span>
          {skin.isStatTrak ? (
            <span className="rounded-full border border-orange-500/40 px-2.5 py-1 text-orange-200">
              StatTrak
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm font-semibold text-orange-400">{skin.weapon}</p>
        <h3 className="mt-1 break-words text-lg font-bold text-white">
          {skin.skinName}
        </h3>
        <p className="mt-2 break-words text-sm text-zinc-400">{skin.exterior}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 text-sm">
          <div className="min-w-0">
            <dt className="text-zinc-500">模拟价格</dt>
            <dd className="mt-1 break-words font-semibold text-zinc-100">
              CAD {skin.startingPrice.toFixed(2)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-zinc-500">24 小时模拟变化</dt>
            <dd className={`mt-1 break-words font-semibold ${changeClassName}`}>
              {formatPriceChange(skin.priceChange24h)}
            </dd>
          </div>
        </dl>
        <Link
          href={`/market/${skin.id}`}
          className="mt-5 inline-flex self-start rounded-lg border border-orange-500/40 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          查看模拟详情
        </Link>
      </div>
    </article>
  );
}
