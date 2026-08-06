import Link from "next/link";
import type { NewsArticle } from "@/types/news";
import HomeNewsCard from "./HomeNewsCard";

interface NewsPreviewProps {
  articles: readonly NewsArticle[];
}

export default function NewsPreview({ articles }: NewsPreviewProps) {
  return (
    <section
      aria-labelledby="news-preview-heading"
      className="border-y border-zinc-900 bg-zinc-950/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-400">新闻预览</p>
            <h2 id="news-preview-heading" className="mt-1 text-3xl font-bold text-white">
              本地模拟 CS2 内容
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              以下标题与文章均为虚构演示内容，不代表 Valve、媒体或赛事组织发布的信息。
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex self-start text-sm font-semibold text-orange-300 underline decoration-orange-500/40 underline-offset-4 hover:text-orange-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:self-auto"
          >
            查看全部 CS2 新闻 →
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <HomeNewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
