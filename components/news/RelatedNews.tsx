import Link from "next/link";
import type { NewsArticle } from "@/types/news";

interface RelatedNewsProps {
  articles: readonly NewsArticle[];
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function RelatedNews({ articles }: RelatedNewsProps) {
  return (
    <section aria-labelledby="related-news-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">稳定规则推荐</p>
          <h2
            id="related-news-heading"
            className="mt-1 text-2xl font-semibold text-zinc-50"
          >
            相关文章
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          推荐结果来自本地模拟分类与标签，不代表真实媒体推荐。
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-orange-500/15 px-2 py-1 font-medium text-orange-300">
                  模拟新闻
                </span>
                <span className="text-zinc-400">{article.category}</span>
              </div>
              <h3 className="mt-4 break-words text-lg font-semibold leading-snug text-zinc-50">
                {article.title}
              </h3>
              <p className="mt-2 flex-1 break-words text-sm leading-6 text-zinc-400">
                {article.summary}
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                演示发布日期：
                <time dateTime={article.publishedAt}>
                  {dateFormatter.format(new Date(article.publishedAt))}
                </time>
              </p>
              <Link
                href={`/news/${article.slug}`}
                className="mt-5 inline-flex self-start rounded-lg border border-orange-500/50 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
              >
                阅读模拟详情
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 text-sm text-zinc-400">
          暂无其他模拟新闻可供推荐。
        </p>
      )}
    </section>
  );
}
