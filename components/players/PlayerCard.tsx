import type { Player, PlayerStatus } from "@/types/player";

interface PlayerCardProps {
  player: Player;
}

const STATUS_PRESENTATION: Record<
  PlayerStatus,
  { label: string; className: string }
> = {
  Active: {
    label: "Active · 活跃",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  Benched: {
    label: "Benched · 替补",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  },
  Inactive: {
    label: "Inactive · 非活跃",
    className: "border-zinc-500/50 bg-zinc-500/10 text-zinc-300",
  },
};

export default function PlayerCard({ player }: PlayerCardProps) {
  const status = STATUS_PRESENTATION[player.status];

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-lg shadow-black/10">
      <div className="flex min-h-36 items-center justify-center border-b border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 px-6 py-8 text-center">
        <div className="min-w-0">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-xl font-bold text-orange-300">
            {player.nickname.slice(0, 1)}
          </span>
          <p className="break-words text-xl font-bold text-zinc-50">
            {player.nickname}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-orange-300 uppercase">
            本地模拟选手
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-sm text-zinc-400">模拟真实姓名</p>
            <p className="break-words font-medium text-zinc-100">
              {player.realName}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="min-w-0">
            <dt className="text-zinc-500">模拟战队</dt>
            <dd className="break-words text-zinc-200">{player.team}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-zinc-500">国籍 / 地区</dt>
            <dd className="break-words text-zinc-200">
              {player.nationality} · {player.region}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="选手角色">
          {player.roles.map((role) => (
            <span
              key={role}
              className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-200"
            >
              {role}
            </span>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-zinc-500">DPI</dt>
            <dd className="mt-1 font-semibold text-zinc-100">{player.dpi}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">灵敏度</dt>
            <dd className="mt-1 font-semibold text-zinc-100">
              {player.sensitivity}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">eDPI</dt>
            <dd className="mt-1 font-semibold text-zinc-100">
              {player.effectiveDpi}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">分辨率</dt>
            <dd className="mt-1 break-words font-semibold text-zinc-100">
              {player.resolution}
            </dd>
          </div>
        </dl>

        <div className="mt-4 min-w-0 border-t border-zinc-800 pt-4 text-sm">
          <p className="text-zinc-500">模拟鼠标</p>
          <p className="break-words text-zinc-200">{player.mouse}</p>
        </div>
      </div>
    </article>
  );
}
