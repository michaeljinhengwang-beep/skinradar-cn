"use client";

import { useMemo, useState } from "react";
import { queryPlayers } from "@/lib/players";
import {
  ALL_PLAYER_FILTER_VALUE,
  PLAYER_REGIONS,
  PLAYER_ROLES,
  PLAYER_STATUSES,
  type Player,
  type PlayerQueryOptions,
  type PlayerTeam,
} from "@/types/player";
import PlayerFilters from "./PlayerFilters";
import PlayerGrid from "./PlayerGrid";

interface PlayerExplorerProps {
  players: readonly Player[];
}

const DEFAULT_QUERY: PlayerQueryOptions = {
  query: "",
  team: ALL_PLAYER_FILTER_VALUE,
  region: ALL_PLAYER_FILTER_VALUE,
  role: ALL_PLAYER_FILTER_VALUE,
  status: ALL_PLAYER_FILTER_VALUE,
  sort: "default",
};

export default function PlayerExplorer({ players }: PlayerExplorerProps) {
  const [options, setOptions] = useState<PlayerQueryOptions>(DEFAULT_QUERY);

  const teams = useMemo(
    () =>
      Array.from(new Set(players.map((player) => player.team))).sort(
        (first, second) => first.localeCompare(second, "en"),
      ) as PlayerTeam[],
    [players],
  );

  const results = useMemo(
    () => queryPlayers(players, options),
    [players, options],
  );

  return (
    <div className="mt-8">
      <PlayerFilters
        filters={options}
        sort={options.sort}
        teams={teams}
        regions={PLAYER_REGIONS}
        roles={PLAYER_ROLES}
        statuses={PLAYER_STATUSES}
        onQueryChange={(query) =>
          setOptions((current) => ({ ...current, query }))
        }
        onTeamChange={(team) =>
          setOptions((current) => ({ ...current, team }))
        }
        onRegionChange={(region) =>
          setOptions((current) => ({ ...current, region }))
        }
        onRoleChange={(role) =>
          setOptions((current) => ({ ...current, role }))
        }
        onStatusChange={(status) =>
          setOptions((current) => ({ ...current, status }))
        }
        onSortChange={(sort) =>
          setOptions((current) => ({ ...current, sort }))
        }
        onReset={() => setOptions(DEFAULT_QUERY)}
      />
      <PlayerGrid players={results} />
    </div>
  );
}
