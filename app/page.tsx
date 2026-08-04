import HeroSection from "@/components/home/HeroSection";
import StatCard from "@/components/home/StatCard";

const stats = [
  { label: "追踪饰品", value: "10,000+" },
  { label: "覆盖市场", value: "8 个" },
  { label: "价格更新", value: "每日" },
];

export default function Home() {
  return (
    <div className="bg-zinc-950 text-white">
      <HeroSection />

      <section
        aria-label="平台数据概览"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-20 md:grid-cols-3"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>
    </div>
  );
}
