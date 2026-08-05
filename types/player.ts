export const PLAYER_ROLES = [
  "Rifler",
  "AWPer",
  "IGL",
  "Entry",
  "Support",
  "Lurker",
] as const;

export const PLAYER_REGIONS = [
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Oceania",
  "CIS",
  "Other",
] as const;

export const PLAYER_STATUSES = ["Active", "Benched", "Inactive"] as const;

export const PLAYER_TEAMS = [
  "Aurora Grid",
  "Vector Harbor",
  "Eastern Arc",
  "Northline Echo",
  "Crimson Circuit",
  "Solar Meridian",
] as const;

export const PLAYER_SORT_OPTIONS = [
  "default",
  "nickname-asc",
  "team-asc",
  "sensitivity-low",
  "sensitivity-high",
] as const;

export const ALL_PLAYER_FILTER_VALUE = "all" as const;

export type PlayerRole = (typeof PLAYER_ROLES)[number];
export type PlayerRegion = (typeof PLAYER_REGIONS)[number];
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];
export type PlayerTeam = (typeof PLAYER_TEAMS)[number];
export type PlayerSortOption = (typeof PLAYER_SORT_OPTIONS)[number];
export type AllPlayerFilterValue = typeof ALL_PLAYER_FILTER_VALUE;

export interface Player {
  id: string;
  nickname: string;
  realName: string;
  team: PlayerTeam;
  nationality: string;
  region: PlayerRegion;
  roles: PlayerRole[];
  status: PlayerStatus;
  image: string | null;
  mouse: string;
  keyboard: string;
  headset: string;
  monitor: string;
  mousepad: string;
  sensitivity: number;
  dpi: number;
  effectiveDpi: number;
  zoomSensitivity: number;
  resolution: string;
  aspectRatio: string;
  crosshairCode: string;
  updatedAt: string;
}

export interface PlayerFilterOptions {
  query: string;
  team: PlayerTeam | AllPlayerFilterValue;
  region: PlayerRegion | AllPlayerFilterValue;
  role: PlayerRole | AllPlayerFilterValue;
  status: PlayerStatus | AllPlayerFilterValue;
}

export interface PlayerQueryOptions extends PlayerFilterOptions {
  sort: PlayerSortOption;
}
