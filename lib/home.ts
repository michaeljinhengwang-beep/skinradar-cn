import { getFeaturedNews, sortNews } from "./news.ts";
import type { Skin } from "../types/market.ts";
import type { Player } from "../types/player.ts";
import type { NewsArticle } from "../types/news.ts";

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) return 0;
  return Math.floor(limit);
}

export function getHomepageSkinPreview(
  skins: readonly Skin[],
  limit: number,
): Skin[] {
  const safeLimit = normalizeLimit(limit);
  if (safeLimit === 0) return [];

  const prioritized = [
    ...skins.filter((skin) => skin.isStatTrak),
    ...skins.filter((skin) => !skin.isStatTrak),
  ];
  const selected: Skin[] = [];
  const selectedIds = new Set<string>();
  const selectedWeapons = new Set<string>();

  prioritized.forEach((skin) => {
    if (selected.length >= safeLimit || selectedWeapons.has(skin.weapon)) return;
    selected.push(skin);
    selectedIds.add(skin.id);
    selectedWeapons.add(skin.weapon);
  });

  prioritized.forEach((skin) => {
    if (selected.length >= safeLimit || selectedIds.has(skin.id)) return;
    selected.push(skin);
    selectedIds.add(skin.id);
  });

  return selected;
}

export function getHomepagePlayerPreview(
  players: readonly Player[],
  limit: number,
): Player[] {
  const safeLimit = normalizeLimit(limit);
  if (safeLimit === 0) return [];

  const selected: Player[] = [];
  const selectedIds = new Set<string>();
  const selectedTeams = new Set<string>();
  const selectedPrimaryRoles = new Set<string>();

  players.forEach((player) => {
    const primaryRole = player.roles[0];
    if (
      selected.length >= safeLimit ||
      selectedTeams.has(player.team) ||
      selectedPrimaryRoles.has(primaryRole)
    ) {
      return;
    }
    selected.push(player);
    selectedIds.add(player.id);
    selectedTeams.add(player.team);
    selectedPrimaryRoles.add(primaryRole);
  });

  players.forEach((player) => {
    if (
      selected.length >= safeLimit ||
      selectedIds.has(player.id) ||
      selectedTeams.has(player.team)
    ) {
      return;
    }
    selected.push(player);
    selectedIds.add(player.id);
    selectedTeams.add(player.team);
  });

  players.forEach((player) => {
    if (selected.length >= safeLimit || selectedIds.has(player.id)) return;
    selected.push(player);
    selectedIds.add(player.id);
  });

  return selected;
}

export function getHomepageNewsPreview(
  articles: readonly NewsArticle[],
  limit: number,
): NewsArticle[] {
  const safeLimit = normalizeLimit(limit);
  if (safeLimit === 0) return [];

  const featured = getFeaturedNews(articles);
  const featuredIds = new Set(featured.map((article) => article.id));
  const remaining = sortNews(
    articles.filter((article) => !featuredIds.has(article.id)),
    "newest",
  );

  return [...featured, ...remaining].slice(0, safeLimit);
}
