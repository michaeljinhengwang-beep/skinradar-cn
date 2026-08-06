import { mockNews } from "../data/mock-news.ts";
import { mockPlayers } from "../data/mock-players.ts";
import { mockSkins } from "../data/mock-skins.ts";

const LOCAL_SITE_URL = "http://localhost:3000";
const DEMO_SITE_UPDATED_AT = "2026-08-06";

export function resolveSiteUrl(value?: string): URL {
  if (!value?.trim()) return new URL(LOCAL_SITE_URL);

  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return new URL(LOCAL_SITE_URL);
    }

    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return new URL(LOCAL_SITE_URL);
  }
}

export const siteConfig = {
  name: "SkinRadar",
  shortName: "SkinRadar",
  description:
    "面向中文 CS2 用户的饰品市场、模拟选手配置和模拟新闻产品演示平台；当前仅使用本地模拟数据。",
  defaultTitle: "SkinRadar｜CS2 数据产品演示版",
  titleTemplate: "%s | SkinRadar",
  locale: "zh-CN",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  author: "SkinRadar",
  keywords: ["SkinRadar", "CS2", "饰品市场演示", "选手配置演示", "模拟新闻"],
  navigation: [
    { label: "首页", href: "/" },
    { label: "市场", href: "/market" },
    { label: "职业选手", href: "/players" },
    { label: "新闻", href: "/news" },
  ],
} as const;

export function getAbsoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export function buildSitemapEntries() {
  const staticEntries = [
    { path: "/", priority: 1 },
    { path: "/market", priority: 0.8 },
    { path: "/players", priority: 0.8 },
    { path: "/news", priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: getAbsoluteUrl(path),
    lastModified: DEMO_SITE_UPDATED_AT,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const skinEntries = mockSkins.map((skin) => ({
    url: getAbsoluteUrl(`/market/${skin.id}`),
    lastModified: skin.priceHistory.at(-1)?.date ?? DEMO_SITE_UPDATED_AT,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const playerEntries = mockPlayers.map((player) => ({
    url: getAbsoluteUrl(`/players/${player.id}`),
    lastModified: player.updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const newsEntries = mockNews.map((article) => ({
    url: getAbsoluteUrl(`/news/${article.slug}`),
    lastModified: article.updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...skinEntries, ...playerEntries, ...newsEntries];
}

export function buildRobotsConfig() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
  };
}

export function buildManifestConfig() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone" as const,
    background_color: "#09090b",
    theme_color: "#f97316",
    lang: siteConfig.locale,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
