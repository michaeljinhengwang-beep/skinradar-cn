import Link from "next/link";
import type { Player } from "@/types/player";
import HomePlayerCard from "./HomePlayerCard";

interface PlayerPreviewProps {
  players: readonly Player[];
}

export default function PlayerPreview({ players }: PlayerPreviewProps) {
  return (
    <section
      aria-labelledby="player-preview-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-orange-400">选手预览</p>
          <h2 id="player-preview-heading" className="mt-1 text-3xl font-bold text-white">
            虚构职业选手配置
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            昵称、战队、游戏设置和外设均为模拟内容，不代表真实职业选手资料。
          </p>
        </div>
        <Link
          href="/players"
          className="inline-flex self-start text-sm font-semibold text-orange-300 underline decoration-orange-500/40 underline-offset-4 hover:text-orange-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:self-auto"
        >
          查看全部职业选手配置 →
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        {players.map((player) => (
          <HomePlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
}
