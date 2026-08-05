import type { Skin } from "@/types/market";
import SkinCard from "./SkinCard";

type SkinGridProps = {
  skins: readonly Skin[];
};

export default function SkinGrid({ skins }: SkinGridProps) {
  return (
    <section aria-labelledby="market-results-heading" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="market-results-heading" className="text-2xl font-bold">
          饰品结果
        </h2>
        <p aria-live="polite" className="text-sm text-zinc-400">
          共 {skins.length} 条模拟结果
        </p>
      </div>

      {skins.length === 0 ? (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-5 py-16 text-center"
        >
          <h3 className="text-lg font-semibold text-zinc-200">暂无匹配结果</h3>
          <p className="mx-auto mt-2 max-w-xl leading-7 text-zinc-400">
            没有找到符合当前条件的饰品，请调整搜索或筛选条件。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {skins.map((skin) => (
            <SkinCard key={skin.id} skin={skin} />
          ))}
        </div>
      )}
    </section>
  );
}
