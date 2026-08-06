import Link from "next/link";
import type { NewsArticle } from "@/types/news";

interface HomeNewsCardProps {
  article: NewsArticle;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function HomeNewsCard({ article }: HomeNewsCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-semibold text-orange-300">
          模拟新闻
        </span>
        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-zinc-300">
          {article.category}
        </span>
      </div>
      <h3 className="mt-4 break-words text-xl font-bold leading-snug text-white">
        {article.title}
      </h3>
      <p className="mt-3 flex-1 break-words text-sm leading-6 text-zinc-400">
        {article.summary}
      </p>
      <p className="mt-5 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        演示发布日期：
        <time dateTime={article.publishedAt}>
          {dateFormatter.format(new Date(article.publishedAt))}
        </time>
        <span aria-hidden="true"> · </span>
        {article.readingTimeMinutes} 分钟
      </p>
      <Link
        href={`/news/${article.slug}`}
        className="mt-5 inline-flex self-start rounded-lg border border-orange-500/40 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        阅读模拟文章
      </Link>
    </article>
  );
}
