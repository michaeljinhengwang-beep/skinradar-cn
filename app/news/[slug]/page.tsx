import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsArticleContent from "@/components/news/NewsArticleContent";
import NewsMetadata from "@/components/news/NewsMetadata";
import RelatedNews from "@/components/news/RelatedNews";
import { mockNews } from "@/data/mock-news";
import { getNewsBySlug, getRelatedNews } from "@/lib/news";

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockNews.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(mockNews, slug);

  if (!article) {
    return {
      title: "模拟新闻未找到",
      description: "未找到对应的 SkinRadar 本地虚构新闻内容。",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${article.title}｜模拟新闻`,
    description: `${article.summary} 本页为 SkinRadar 本地虚构模拟新闻，不代表真实媒体内容。`,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const article = getNewsBySlug(mockNews, slug);

  if (!article) {
    notFound();
  }

  const relatedNews = getRelatedNews(mockNews, article, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        href="/news"
        className="inline-flex text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
      >
        ← 返回 CS2 新闻目录
      </Link>

      <article className="mt-8 min-w-0">
        <header className="max-w-4xl min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-orange-500/15 px-3 py-1.5 font-semibold text-orange-300">
              模拟新闻
            </span>
            <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300">
              {article.category}
            </span>
            <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300">
              {article.region}
            </span>
            {article.isFeatured ? (
              <span className="rounded-full border border-orange-500/40 px-3 py-1.5 font-medium text-orange-200">
                模拟精选
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 break-words text-3xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 break-words text-lg leading-8 text-zinc-300">
            {article.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="新闻标签">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300"
              >
                {tag}
              </li>
            ))}
          </ul>
        </header>

        <aside
          aria-label="模拟新闻免责声明"
          className="mt-8 max-w-4xl rounded-2xl border border-orange-500/35 bg-orange-500/10 p-5 text-sm leading-7 text-orange-100"
        >
          <p className="font-semibold text-orange-300">本地虚构内容说明</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>当前文章为本地虚构模拟内容，不代表 Valve、HLTV、真实选手、战队或媒体。</li>
            <li>内容不可作为事实引用；日期、来源、作者和模拟热度均为演示数据。</li>
            <li>后续接入真实新闻前，必须确认内容来源、使用许可、事实和更新时间。</li>
          </ul>
        </aside>

        <div className="mt-8 grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <NewsArticleContent sections={article.contentSections} />
          <NewsMetadata article={article} />
        </div>
      </article>

      <div className="mt-14">
        <RelatedNews articles={relatedNews} />
      </div>
    </div>
  );
}
