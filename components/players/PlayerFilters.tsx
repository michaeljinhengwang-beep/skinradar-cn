import type {
  PlayerFilterOptions,
  PlayerRegion,
  PlayerRole,
  PlayerSortOption,
  PlayerStatus,
  PlayerTeam,
} from "@/types/player";

interface PlayerFiltersProps {
  filters: PlayerFilterOptions;
  sort: PlayerSortOption;
  teams: readonly PlayerTeam[];
  regions: readonly PlayerRegion[];
  roles: readonly PlayerRole[];
  statuses: readonly PlayerStatus[];
  onQueryChange: (query: string) => void;
  onTeamChange: (team: PlayerFilterOptions["team"]) => void;
  onRegionChange: (region: PlayerFilterOptions["region"]) => void;
  onRoleChange: (role: PlayerFilterOptions["role"]) => void;
  onStatusChange: (status: PlayerFilterOptions["status"]) => void;
  onSortChange: (sort: PlayerSortOption) => void;
  onReset: () => void;
}

const controlClassName =
  "mt-2 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25";

const statusLabels: Record<PlayerStatus, string> = {
  Active: "Active · 活跃",
  Benched: "Benched · 替补",
  Inactive: "Inactive · 非活跃",
};

const sortOptions: ReadonlyArray<{
  value: PlayerSortOption;
  label: string;
}> = [
  { value: "default", label: "默认顺序" },
  { value: "nickname-asc", label: "昵称 A–Z" },
  { value: "team-asc", label: "战队 A–Z" },
  { value: "sensitivity-low", label: "灵敏度从低到高" },
  { value: "sensitivity-high", label: "灵敏度从高到低" },
];

export default function PlayerFilters({
  filters,
  sort,
  teams,
  regions,
  roles,
  statuses,
  onQueryChange,
  onTeamChange,
  onRegionChange,
  onRoleChange,
  onStatusChange,
  onSortChange,
  onReset,
}: PlayerFiltersProps) {
  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5"
      aria-labelledby="player-filters-heading"
    >
      <h2 id="player-filters-heading" className="text-lg font-semibold">
        搜索与筛选
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-8">
        <label className="min-w-0 xl:col-span-2" htmlFor="player-query">
          <span className="text-sm font-medium text-zinc-300">关键词</span>
          <input
            id="player-query"
            type="search"
            value={filters.query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="昵称、姓名、战队或国籍"
            className={controlClassName}
          />
        </label>

        <label className="min-w-0" htmlFor="player-team">
          <span className="text-sm font-medium text-zinc-300">战队</span>
          <select
            id="player-team"
            value={filters.team}
            onChange={(event) =>
              onTeamChange(event.target.value as PlayerFilterOptions["team"])
            }
            className={controlClassName}
          >
            <option value="all">全部战队</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0" htmlFor="player-region">
          <span className="text-sm font-medium text-zinc-300">地区</span>
          <select
            id="player-region"
            value={filters.region}
            onChange={(event) =>
              onRegionChange(event.target.value as PlayerFilterOptions["region"])
            }
            className={controlClassName}
          >
            <option value="all">全部地区</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0" htmlFor="player-role">
          <span className="text-sm font-medium text-zinc-300">角色</span>
          <select
            id="player-role"
            value={filters.role}
            onChange={(event) =>
              onRoleChange(event.target.value as PlayerFilterOptions["role"])
            }
            className={controlClassName}
          >
            <option value="all">全部角色</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0" htmlFor="player-status">
          <span className="text-sm font-medium text-zinc-300">状态</span>
          <select
            id="player-status"
            value={filters.status}
            onChange={(event) =>
              onStatusChange(event.target.value as PlayerFilterOptions["status"])
            }
            className={controlClassName}
          >
            <option value="all">全部状态</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0" htmlFor="player-sort">
          <span className="text-sm font-medium text-zinc-300">排序</span>
          <select
            id="player-sort"
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as PlayerSortOption)
            }
            className={controlClassName}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-orange-500/60 hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            重置筛选
          </button>
        </div>
      </div>
    </section>
  );
}
