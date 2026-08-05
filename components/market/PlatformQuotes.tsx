import type { PlatformQuote } from "@/types/market";
import { sortPlatformQuotesByPrice } from "@/lib/market";

type PlatformQuotesProps = {
  quotes: readonly PlatformQuote[];
};

function formatDemoUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(updatedAt));
}

export default function PlatformQuotes({ quotes }: PlatformQuotesProps) {
  const sortedQuotes = sortPlatformQuotesByPrice(quotes);

  return (
    <section
      aria-labelledby="platform-quotes-heading"
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold text-orange-400">本地演示内容</p>
        <h2 id="platform-quotes-heading" className="mt-1 text-2xl font-bold">
          模拟平台报价
        </h2>
      </div>

      {sortedQuotes.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center text-zinc-400">
          暂无模拟平台报价。
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {sortedQuotes.map((quote, index) => (
            <li
              key={quote.platform}
              className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-zinc-100">{quote.platform}</p>
                {index === 0 ? (
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-300">
                    最低模拟报价
                  </span>
                ) : null}
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-zinc-500">模拟价格</dt>
                  <dd className="mt-1 break-words font-semibold text-white">
                    {quote.currency} {quote.price.toFixed(2)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-zinc-500">模拟在售数量</dt>
                  <dd className="mt-1 font-semibold text-zinc-200">
                    {quote.listings} 件
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-zinc-500">固定演示更新时间（UTC）</dt>
                  <dd className="mt-1 break-words text-zinc-300">
                    <time dateTime={quote.updatedAt}>
                      {formatDemoUpdatedAt(quote.updatedAt)}
                    </time>
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
