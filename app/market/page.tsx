import MarketExplorer from "@/components/market/MarketExplorer";
import { mockSkins } from "@/data/mock-skins";

export default function MarketPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
          SkinRadar
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">皮肤市场</h1>
        <p className="mt-5 max-w-3xl leading-7 text-zinc-400">
          浏览用于开发搜索、筛选和排序界面的本地模拟饰品数据。
        </p>
      </header>

      <aside
        aria-label="模拟数据说明"
        className="mt-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5 text-sm leading-7 text-orange-100"
      >
        <p className="font-semibold text-orange-300">模拟数据说明</p>
        <p className="mt-1">
          本页的价格、24 小时涨跌幅、在售数量、平台报价和日期均为固定的本地演示内容，不代表真实市场行情或实时数据。
        </p>
      </aside>

      <MarketExplorer skins={mockSkins} />
    </div>
  );
}
