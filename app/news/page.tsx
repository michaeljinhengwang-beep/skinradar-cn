import type { Metadata } from "next";
import FeaturedNews from "@/components/news/FeaturedNews";
import NewsExplorer from "@/components/news/NewsExplorer";
import { mockNews } from "@/data/mock-news";
import { getFeaturedNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "模拟 CS2 新闻",
  description:
    "浏览 SkinRadar 本地虚构 CS2 新闻目录和文章演示；内容不代表 Valve、HLTV 或真实媒体报道。",
};

export default function NewsPage() {
  const featuredNews = getFeaturedNews(mockNews);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
          SkinRadar News Demo
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          CS2 新闻
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-300">
          浏览按分类、地区与标签组织的新闻目录，体验关键词搜索和基础排序界面。
        </p>
      </header>

      <aside className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 text-sm leading-6 text-orange-100">
        <p className="font-semibold">本页全部内容均为本地虚构模拟新闻。</p>
        <p className="mt-1 text-orange-100/85">
          内容不来自 Valve、HLTV、战队、选手或新闻媒体，不可作为事实引用。接入真实新闻前，必须完成来源授权、事实核验和更新机制验证。
        </p>
      </aside>

      <div className="mt-12">
        <FeaturedNews articles={featuredNews} />
      </div>

      <div className="mt-12">
        <NewsExplorer articles={mockNews} />
      </div>
    </div>
  );
}
