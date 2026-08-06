import Link from "next/link";
import type { NewsArticle } from "@/types/news";

interface NewsCardProps {
  article: NewsArticle;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-medium text-orange-300">
          模拟新闻
        </span>
        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-zinc-300">
          {article.category}
        </span>
        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-zinc-300">
          {article.region}
        </span>
        {article.isFeatured ? (
          <span className="rounded-full border border-orange-500/40 px-2.5 py-1 text-orange-200">
            模拟精选
          </span>
        ) : null}
      </div>

      <div className="mt-4 min-w-0 flex-1">
        <h3 className="break-words text-xl font-semibold leading-snug text-zinc-50">
          {article.title}
        </h3>
        <p className="mt-3 break-words text-sm leading-6 text-zinc-300">
          {article.summary}
        </p>
        <p className="mt-3 break-words text-sm leading-6 text-zinc-400">
          {article.contentPreview}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-zinc-500">模拟作者</dt>
          <dd className="mt-1 break-words text-zinc-200">{article.author}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">模拟来源标签</dt>
          <dd className="mt-1 break-words text-zinc-200">
            {article.sourceLabel}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">演示发布日期</dt>
          <dd className="mt-1 text-zinc-200">
            <time dateTime={article.publishedAt}>
              {dateFormatter.format(new Date(article.publishedAt))}
            </time>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">阅读信息</dt>
          <dd className="mt-1 text-zinc-200">
            {article.readingTimeMinutes} 分钟 · 模拟热度 {article.popularityScore}/100
          </dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="新闻标签">
        {article.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
          >
            {tag}
          </li>
        ))}
      </ul>

      <Link
        href={`/news/${article.slug}`}
        className="mt-5 inline-flex self-start rounded-lg border border-orange-500/50 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
      >
        查看模拟文章
      </Link>
    </article>
  );
}
