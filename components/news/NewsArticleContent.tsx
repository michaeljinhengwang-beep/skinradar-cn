interface NewsArticleContentProps {
  sections: readonly string[];
}

export default function NewsArticleContent({
  sections,
}: NewsArticleContentProps) {
  return (
    <section
      aria-labelledby="simulated-article-content-heading"
      className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8"
    >
      <p className="text-sm font-medium text-orange-400">本地界面演示内容</p>
      <h2
        id="simulated-article-content-heading"
        className="mt-2 text-2xl font-semibold text-zinc-50"
      >
        模拟文章正文
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        以下为用于详情页开发的简短虚构段落，不是完整真实报道。
      </p>

      <div className="mt-7 space-y-5">
        {sections.map((section, index) => (
          <p
            key={`${index}-${section.slice(0, 24)}`}
            className="break-words text-base leading-8 text-zinc-300"
          >
            {section}
          </p>
        ))}
      </div>
    </section>
  );
}
