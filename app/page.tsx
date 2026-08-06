import type { Metadata } from "next";
import DemoDataNotice from "@/components/home/DemoDataNotice";
import DemoStats from "@/components/home/DemoStats";
import FeatureOverview from "@/components/home/FeatureOverview";
import FinalCallToAction from "@/components/home/FinalCallToAction";
import HeroSection from "@/components/home/HeroSection";
import MarketPreview from "@/components/home/MarketPreview";
import NewsPreview from "@/components/home/NewsPreview";
import PlayerPreview from "@/components/home/PlayerPreview";
import { mockNews } from "@/data/mock-news";
import { mockPlayers } from "@/data/mock-players";
import { mockSkins } from "@/data/mock-skins";
import {
  getHomepageNewsPreview,
  getHomepagePlayerPreview,
  getHomepageSkinPreview,
} from "@/lib/home";

export const metadata: Metadata = {
  title: {
    absolute: "SkinRadar｜CS2 数据产品演示入口",
  },
  description:
    "SkinRadar 前端展示版统一入口，提供本地模拟饰品市场、虚构选手配置和模拟新闻预览。",
};

export default function Home() {
  const skinPreview = getHomepageSkinPreview(mockSkins, 4);
  const playerPreview = getHomepagePlayerPreview(mockPlayers, 3);
  const newsPreview = getHomepageNewsPreview(mockNews, 3);

  return (
    <>
      <HeroSection />
      <DemoDataNotice />
      <DemoStats
        skinCount={mockSkins.length}
        playerCount={mockPlayers.length}
        newsCount={mockNews.length}
      />
      <FeatureOverview />
      <MarketPreview skins={skinPreview} />
      <PlayerPreview players={playerPreview} />
      <NewsPreview articles={newsPreview} />
      <FinalCallToAction />
    </>
  );
}
