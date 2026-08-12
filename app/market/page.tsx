import type { Metadata } from "next";
import MarketExplorer from "@/components/market/MarketExplorer";
import MarketListingExplorer from "@/components/market/MarketListingExplorer";
import { getMarketPageData } from "@/lib/services/market-read-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "皮肤市场",
  description:
    "浏览 SkinRadar 最近同步的 CSFloat 市场数据；数据不可用时，页面会明确回退到本地模拟饰品。",
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Shanghai",
});

export default async function MarketPage() {
  const marketData = await getMarketPageData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
          SkinRadar
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">皮肤市场</h1>
        <p className="mt-5 max-w-3xl leading-7 text-zinc-400">
          浏览最近同步的市场 listing，或在数据服务不可用时继续使用明确标注的本地模拟界面。
        </p>
      </header>

      {marketData.fallback ? (
        <>
          <aside
            aria-label="市场数据回退说明"
            className="mt-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5 text-sm leading-7 text-orange-100"
          >
            <p className="font-semibold text-orange-300">模拟数据</p>
            <p className="mt-1">
              当前无法读取真实市场数据，正在展示本地模拟数据。价格、24
              小时涨跌幅、在售数量、平台报价和日期均为固定演示内容，不代表真实市场行情。
            </p>
          </aside>
          <MarketExplorer skins={marketData.data} />
        </>
      ) : (
        <>
          <aside
            aria-label="真实市场数据状态"
            className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm leading-7 text-emerald-50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-emerald-300">
                真实市场数据
              </p>
              {marketData.stale ? (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  数据可能已过期
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  数据新鲜
                </span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="inline text-zinc-400">数据源：</dt>
                <dd className="inline font-semibold text-zinc-100">
                  CSFloat
                </dd>
              </div>
              <div>
                <dt className="inline text-zinc-400">最近同步：</dt>
                <dd className="inline font-semibold text-zinc-100">
                  <time dateTime={marketData.fetchedAt}>
                    {dateFormatter.format(new Date(marketData.fetchedAt))}
                  </time>
                </dd>
              </div>
            </dl>
            {marketData.currencyStatus === "confirmed" ? null : (
              <p className="mt-3 text-amber-200">
                部分或全部报价的货币单位尚未确认；对应卡片仅展示金额数值，不标记 CAD、USD 或货币符号。
              </p>
            )}
            <p className="mt-3 text-zinc-300">
              本页展示已同步数据，不是实时价格，也不构成交易或投资建议。
            </p>
          </aside>
          <MarketListingExplorer listings={marketData.data} />
        </>
      )}
    </div>
  );
}
