import type { PriceHistoryPoint } from "@/types/market";
import { sortPriceHistoryByDate } from "@/lib/market";

type PriceHistoryTableProps = {
  history: readonly PriceHistoryPoint[];
};

export default function PriceHistoryTable({
  history,
}: PriceHistoryTableProps) {
  const sortedHistory = sortPriceHistoryByDate(history);

  return (
    <section
      aria-labelledby="price-history-heading"
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold text-orange-400">本地演示内容</p>
        <h2 id="price-history-heading" className="mt-1 text-2xl font-bold">
          模拟价格历史
        </h2>
      </div>

      {sortedHistory.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center text-zinc-400">
          暂无模拟价格历史。
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">
              按日期从旧到新排列的本地模拟价格历史
            </caption>
            <thead className="bg-zinc-950 text-zinc-400">
              <tr>
                <th scope="col" className="w-1/2 px-4 py-3 font-medium">
                  日期
                </th>
                <th scope="col" className="w-1/2 px-4 py-3 font-medium">
                  模拟价格
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedHistory.map((point) => (
                <tr key={point.date} className="bg-zinc-950/50">
                  <td className="break-words px-4 py-3 text-zinc-300">
                    <time dateTime={point.date}>{point.date}</time>
                  </td>
                  <td className="break-words px-4 py-3 font-semibold text-white">
                    CAD {point.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
