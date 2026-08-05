import type { Player } from "@/types/player";
import PlayerCard from "./PlayerCard";

interface PlayerGridProps {
  players: readonly Player[];
}

export default function PlayerGrid({ players }: PlayerGridProps) {
  return (
    <section className="mt-8" aria-labelledby="player-results-heading">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="player-results-heading"
          className="text-xl font-semibold text-zinc-100"
        >
          选手结果
        </h2>
        <p className="text-sm text-zinc-400" aria-live="polite">
          共 {players.length} 名模拟选手
        </p>
      </div>

      {players.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-5 py-14 text-center">
          <p className="font-medium text-zinc-200">
            没有找到符合当前条件的选手，请调整搜索或筛选条件。
          </p>
        </div>
      )}
    </section>
  );
}
