import type { NewsArticle } from "@/types/news";

interface NewsMetadataProps {
  article: NewsArticle;
}

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export default function NewsMetadata({ article }: NewsMetadataProps) {
  return (
    <section
      aria-labelledby="news-metadata-heading"
      className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
    >
      <h2 id="news-metadata-heading" className="text-lg font-semibold text-zinc-50">
        新闻元信息
      </h2>
      <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <div className="min-w-0">
          <dt className="text-zinc-500">分类</dt>
          <dd className="mt-1 break-words font-medium text-zinc-200">
            {article.category}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">地区</dt>
          <dd className="mt-1 break-words font-medium text-zinc-200">
            {article.region}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">模拟作者</dt>
          <dd className="mt-1 break-words font-medium text-zinc-200">
            {article.author}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">模拟来源</dt>
          <dd className="mt-1 break-words font-medium text-zinc-200">
            {article.sourceLabel}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">演示发布时间（UTC）</dt>
          <dd className="mt-1 break-words text-zinc-300">
            <time dateTime={article.publishedAt}>
              {dateTimeFormatter.format(new Date(article.publishedAt))}
            </time>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">演示更新时间（UTC）</dt>
          <dd className="mt-1 break-words text-zinc-300">
            <time dateTime={article.updatedAt}>
              {dateTimeFormatter.format(new Date(article.updatedAt))}
            </time>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">预计阅读时间</dt>
          <dd className="mt-1 font-medium text-zinc-200">
            {article.readingTimeMinutes} 分钟
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">模拟热度</dt>
          <dd className="mt-1 font-medium text-zinc-200">
            {article.popularityScore}/100
          </dd>
        </div>
      </dl>
    </section>
  );
}
