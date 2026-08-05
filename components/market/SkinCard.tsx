import type { Skin } from "@/types/market";

type SkinCardProps = {
  skin: Skin;
};

function getPriceChangePresentation(priceChange24h: number) {
  if (priceChange24h > 0) {
    return {
      text: `上涨 +${priceChange24h.toFixed(1)}%`,
      className: "text-emerald-400",
    };
  }

  if (priceChange24h < 0) {
    return {
      text: `下跌 ${priceChange24h.toFixed(1)}%`,
      className: "text-red-400",
    };
  }

  return {
    text: "无变化 0.0%",
    className: "text-zinc-300",
  };
}

export default function SkinCard({ skin }: SkinCardProps) {
  const priceChange = getPriceChangePresentation(skin.priceChange24h);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div
        role="img"
        aria-label={`${skin.weapon} 饰品图片占位区域`}
        className="flex h-36 items-center justify-center border-b border-zinc-800 bg-zinc-950 px-4"
      >
        <span
          aria-hidden="true"
          className="break-words text-center text-2xl font-bold tracking-wide text-zinc-700"
        >
          {skin.weapon}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-400">
            模拟数据
          </span>
          {skin.isStatTrak ? (
            <span className="rounded-full border border-orange-500/40 px-2.5 py-1 text-xs font-semibold text-orange-300">
              StatTrak
            </span>
          ) : null}
          {skin.isSouvenir ? (
            <span className="rounded-full border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300">
              纪念品
            </span>
          ) : null}
        </div>

        <p className="mt-5 text-sm font-semibold text-orange-400">
          {skin.weapon}
        </p>
        <h2 className="mt-1 break-words text-xl font-bold text-white">
          {skin.skinName}
        </h2>
        <p className="mt-2 break-words text-sm text-zinc-400">
          {skin.exterior} · {skin.rarity}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 text-sm">
          <div className="min-w-0">
            <dt className="text-zinc-500">模拟起始价格</dt>
            <dd className="mt-1 break-words font-semibold text-white">
              CAD {skin.startingPrice.toFixed(2)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-zinc-500">24 小时模拟涨跌</dt>
            <dd className={`mt-1 break-words font-semibold ${priceChange.className}`}>
              {priceChange.text}
            </dd>
          </div>
          <div className="col-span-2 min-w-0">
            <dt className="text-zinc-500">模拟在售数量</dt>
            <dd className="mt-1 font-semibold text-zinc-200">
              {skin.availableListings} 件
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
