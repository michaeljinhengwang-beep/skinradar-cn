import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformQuotes from "@/components/market/PlatformQuotes";
import PriceChange from "@/components/market/PriceChange";
import PriceHistoryTable from "@/components/market/PriceHistoryTable";
import { mockSkins } from "@/data/mock-skins";
import { getSkinById } from "@/lib/market";

type MarketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return mockSkins.map((skin) => ({ id: skin.id }));
}

export async function generateMetadata({
  params,
}: MarketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const skin = getSkinById(mockSkins, id);

  if (!skin) {
    return {
      title: "未找到模拟饰品 | SkinRadar",
      description: "SkinRadar 本地模拟饰品页面未找到对应内容。",
    };
  }

  return {
    title: `${skin.name} 模拟详情 | SkinRadar`,
    description: `查看 ${skin.name} 的 SkinRadar 本地模拟报价与模拟价格历史；内容不代表真实市场数据。`,
  };
}

export default async function MarketDetailPage({
  params,
}: MarketDetailPageProps) {
  const { id } = await params;
  const skin = getSkinById(mockSkins, id);

  if (!skin) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/market"
        className="inline-flex text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
      >
        ← 返回皮肤市场
      </Link>

      <aside
        aria-label="模拟数据与风险说明"
        className="mt-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5 text-sm leading-7 text-orange-100"
      >
        <p className="font-semibold text-orange-300">模拟数据说明</p>
        <p className="mt-1">
          本页所有报价和历史价格均为固定的本地模拟数据，不代表任何真实平台或实时市场价格，也不构成交易或投资建议。
        </p>
      </aside>

      <article className="mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            role="img"
            aria-label={`${skin.weapon} 饰品视觉占位区域`}
            className="flex min-h-72 min-w-0 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-12 text-center"
          >
            <span
              aria-hidden="true"
              className="break-words text-4xl font-bold tracking-wide text-zinc-700 sm:text-5xl"
            >
              {skin.weapon}
            </span>
            <span aria-hidden="true" className="mt-3 text-sm text-zinc-500">
              本地视觉占位
            </span>
          </div>

          <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-300">
                模拟数据
              </span>
              {skin.isStatTrak ? (
                <span className="rounded-full border border-orange-500/40 px-2.5 py-1 text-xs font-semibold text-orange-300">
                  StatTrak
                </span>
              ) : null}
              {skin.isSouvenir ? (
                <span className="rounded-full border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300">
                  Souvenir
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-sm font-semibold text-orange-400">
              {skin.weapon}
            </p>
            <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">
              {skin.skinName}
            </h1>

            <dl className="mt-8 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-zinc-500">磨损</dt>
                <dd className="mt-1 break-words font-semibold text-zinc-200">
                  {skin.exterior}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">稀有度</dt>
                <dd className="mt-1 break-words font-semibold text-zinc-200">
                  {skin.rarity}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">StatTrak</dt>
                <dd className="mt-1 font-semibold text-zinc-200">
                  {skin.isStatTrak ? "是" : "否"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Souvenir</dt>
                <dd className="mt-1 font-semibold text-zinc-200">
                  {skin.isSouvenir ? "是" : "否"}
                </dd>
              </div>
            </dl>

            <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-zinc-800 pt-6 text-sm sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-zinc-500">模拟起始价格</dt>
                <dd className="mt-1 break-words font-semibold text-white">
                  CAD {skin.startingPrice.toFixed(2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">24 小时模拟涨跌</dt>
                <dd className="mt-1 break-words">
                  <PriceChange value={skin.priceChange24h} />
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">模拟在售数量</dt>
                <dd className="mt-1 font-semibold text-zinc-200">
                  {skin.availableListings} 件
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <PlatformQuotes quotes={skin.platforms} />
          <PriceHistoryTable history={skin.priceHistory} />
        </div>
      </article>
    </div>
  );
}
