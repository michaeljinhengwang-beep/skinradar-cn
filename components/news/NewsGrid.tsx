import type { NewsArticle } from "@/types/news";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  articles: readonly NewsArticle[];
}

export default function NewsGrid({ articles }: NewsGridProps) {
  return (
    <section aria-labelledby="news-results-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="news-results-heading" className="text-2xl font-semibold text-zinc-50">
          新闻目录结果
        </h2>
        <p className="text-sm text-zinc-400" aria-live="polite">
          共 {articles.length} 条本地模拟新闻
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 px-5 py-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-100">没有找到模拟新闻</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            没有找到符合当前条件的模拟新闻，请调整搜索或筛选条件。
          </p>
        </div>
      )}
    </section>
  );
}
