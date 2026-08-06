import Link from "next/link";
import type { NewsArticle } from "@/types/news";

interface FeaturedNewsProps {
  articles: readonly NewsArticle[];
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function FeaturedNews({ articles }: FeaturedNewsProps) {
  const featuredArticles = articles.slice(0, 3);

  return (
    <section aria-labelledby="featured-news-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">编辑演示区</p>
          <h2
            id="featured-news-heading"
            className="mt-1 text-2xl font-semibold text-zinc-50"
          >
            模拟精选新闻
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          精选状态与文章内容均为本地界面演示，不对应真实新闻推荐。
        </p>
      </div>

      {featuredArticles.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {featuredArticles.map((article) => (
            <article
              key={article.id}
              className="min-w-0 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-zinc-900 p-5"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                <span className="font-medium text-orange-300">
                  精选模拟内容
                </span>
                <span aria-hidden="true">·</span>
                <span>{article.category}</span>
                <span aria-hidden="true">·</span>
                <span>{article.region}</span>
              </div>
              <h3 className="mt-3 break-words text-lg font-semibold leading-snug text-zinc-50">
                {article.title}
              </h3>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-300">
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
                className="mt-5 inline-flex rounded-lg border border-orange-500/50 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
              >
                阅读模拟详情
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-300">
          暂无模拟精选新闻。
        </p>
      )}
    </section>
  );
}
