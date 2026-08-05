import type {
  Player,
  PlayerFilterOptions,
  PlayerQueryOptions,
  PlayerSortOption,
} from "../types/player.ts";

function compareText(first: string, second: string): number {
  return first.localeCompare(second, "en", { sensitivity: "base" });
}

function stableSort(
  players: readonly Player[],
  compare: (first: Player, second: Player) => number,
): Player[] {
  return players
    .map((player, index) => ({ player, index }))
    .sort((first, second) => {
      const compared = compare(first.player, second.player);
      return compared === 0 ? first.index - second.index : compared;
    })
    .map(({ player }) => player);
}

export function getPlayerById(
  players: readonly Player[],
  id: string,
): Player | undefined {
  return players.find((player) => player.id === id);
}

export function searchPlayers(
  players: readonly Player[],
  query: string,
): Player[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");

  if (!normalizedQuery) {
    return [...players];
  }

  return players.filter((player) =>
    [player.nickname, player.realName, player.team, player.nationality].some(
      (value) => value.toLocaleLowerCase("en").includes(normalizedQuery),
    ),
  );
}

export function filterPlayers(
  players: readonly Player[],
  options: PlayerFilterOptions,
): Player[] {
  return searchPlayers(players, options.query).filter(
    (player) =>
      (options.team === "all" || player.team === options.team) &&
      (options.region === "all" || player.region === options.region) &&
      (options.role === "all" || player.roles.includes(options.role)) &&
      (options.status === "all" || player.status === options.status),
  );
}

export function sortPlayers(
  players: readonly Player[],
  sort: PlayerSortOption,
): Player[] {
  switch (sort) {
    case "nickname-asc":
      return stableSort(players, (first, second) =>
        compareText(first.nickname, second.nickname),
      );
    case "team-asc":
      return stableSort(players, (first, second) =>
        compareText(first.team, second.team),
      );
    case "sensitivity-low":
      return stableSort(
        players,
        (first, second) => first.sensitivity - second.sensitivity,
      );
    case "sensitivity-high":
      return stableSort(
        players,
        (first, second) => second.sensitivity - first.sensitivity,
      );
    case "default":
      return [...players];
  }
}

export function queryPlayers(
  players: readonly Player[],
  options: PlayerQueryOptions,
): Player[] {
  return sortPlayers(filterPlayers(players, options), options.sort);
}
