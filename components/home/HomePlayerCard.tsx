import Link from "next/link";
import type { Player } from "@/types/player";

interface HomePlayerCardProps {
  player: Player;
}

export default function HomePlayerCard({ player }: HomePlayerCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-orange-300">模拟选手</p>
          <h3 className="mt-1 break-words text-xl font-bold text-white">
            {player.nickname}
          </h3>
          <p className="mt-1 break-words text-sm text-zinc-400">{player.team}</p>
        </div>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200">
          {player.roles[0]}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-zinc-800 pt-4 text-sm">
        <div>
          <dt className="text-zinc-500">DPI</dt>
          <dd className="mt-1 font-semibold text-zinc-100">{player.dpi}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">灵敏度</dt>
          <dd className="mt-1 font-semibold text-zinc-100">{player.sensitivity}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">eDPI</dt>
          <dd className="mt-1 font-semibold text-zinc-100">{player.effectiveDpi}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">模拟鼠标</dt>
          <dd className="mt-1 break-words text-zinc-200">{player.mouse}</dd>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="text-zinc-500">模拟准星代码</dt>
          <dd className="mt-1 min-w-0">
            <code className="block max-w-full break-all rounded-md bg-zinc-950 px-2.5 py-2 text-xs leading-5 whitespace-normal text-orange-200">
              {player.crosshairCode}
            </code>
          </dd>
        </div>
      </dl>

      <Link
        href={`/players/${player.id}`}
        className="mt-5 inline-flex self-start rounded-lg border border-orange-500/40 px-3 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        查看模拟详情
      </Link>
    </article>
  );
}
