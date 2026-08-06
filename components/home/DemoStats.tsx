import StatCard from "./StatCard";

interface DemoStatsProps {
  skinCount: number;
  playerCount: number;
  newsCount: number;
}

export default function DemoStats({
  skinCount,
  playerCount,
  newsCount,
}: DemoStatsProps) {
  const stats = [
    { label: "本地模拟饰品", value: `${skinCount} 条` },
    { label: "虚构模拟选手", value: `${playerCount} 名` },
    { label: "本地模拟新闻", value: `${newsCount} 篇` },
  ];

  return (
    <section
      aria-labelledby="home-stats-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
    >
      <div className="mb-5">
        <p className="text-sm font-semibold text-orange-400">当前演示内容</p>
        <h2 id="home-stats-heading" className="mt-1 text-2xl font-bold text-white">
          来自项目本地数据集的内容数量
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
