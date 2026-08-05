import HeroSection from "@/components/home/HeroSection";
import StatCard from "@/components/home/StatCard";

const stats = [
  // 模拟展示数据，仅用于当前前端布局，不代表平台已接入真实数据。
  { label: "追踪饰品", value: "10,000+" },
  { label: "覆盖市场", value: "8 个" },
  { label: "价格更新", value: "每日" },
];

export default function Home() {
  return (
    <>
      <HeroSection />

      <section
        aria-label="平台数据概览"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 sm:pb-20 md:grid-cols-3"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>
    </>
  );
}
