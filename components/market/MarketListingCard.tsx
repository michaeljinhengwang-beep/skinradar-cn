import { formatMarketListingPrice } from "@/lib/market-listings";
import type { MarketDisplayListing } from "@/types/market";

type MarketListingCardProps = {
  listing: MarketDisplayListing;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Shanghai",
});

export default function MarketListingCard({
  listing,
}: MarketListingCardProps) {
  const price = formatMarketListingPrice(listing);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div
        role="img"
        aria-label={`${listing.weapon ?? "CS2"} 饰品图片占位区域`}
        className="flex h-36 items-center justify-center border-b border-zinc-800 bg-zinc-950 px-4"
      >
        <span
          aria-hidden="true"
          className="break-words text-center text-2xl font-bold tracking-wide text-zinc-700"
        >
          {listing.weapon ?? "CS2"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            真实市场数据
          </span>
          <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300">
            CSFloat
          </span>
        </div>

        <p className="mt-5 break-words text-sm font-semibold text-orange-400">
          {listing.weapon ?? "武器未分类"}
        </p>
        <h2 className="mt-1 break-words text-xl font-bold text-white">
          {listing.skinName ?? listing.marketHashName}
        </h2>
        {listing.skinName ? (
          <p className="mt-2 break-words text-sm text-zinc-400">
            {listing.marketHashName}
          </p>
        ) : null}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-800 pt-5 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-zinc-500">最近同步价格</dt>
            <dd className="mt-1 break-words font-semibold text-white">
              <span>{price.amount}</span>{" "}
              <span
                className={
                  price.currencyConfirmed
                    ? "text-zinc-300"
                    : "text-amber-300"
                }
              >
                {price.currencyLabel}
              </span>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-zinc-500">磨损</dt>
            <dd className="mt-1 break-words font-semibold text-zinc-200">
              {listing.exterior ?? "未提供"}
            </dd>
          </div>
          {listing.floatValue === null ? null : (
            <div className="min-w-0">
              <dt className="text-zinc-500">Float</dt>
              <dd className="mt-1 break-all font-mono text-zinc-200">
                {listing.floatValue.toFixed(9)}
              </dd>
            </div>
          )}
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-zinc-500">数据观测时间</dt>
            <dd className="mt-1 break-words text-zinc-300">
              <time dateTime={listing.observedAt}>
                {dateFormatter.format(new Date(listing.observedAt))}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
