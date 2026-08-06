import type { Player } from "@/types/player";

interface PlayerEquipmentProps {
  player: Player;
}

export default function PlayerEquipment({ player }: PlayerEquipmentProps) {
  return (
    <section
      aria-labelledby="player-equipment-heading"
      className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-orange-400">本地虚构型号</p>
      <h2 id="player-equipment-heading" className="mt-1 text-2xl font-bold">
        模拟外设配置
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        以下型号仅用于界面展示，不代表真实选手配置，也不构成购买建议。
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-zinc-500">鼠标</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.mouse}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">键盘</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.keyboard}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">鼠标垫</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.mousepad}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">耳机</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.headset}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-zinc-500">显示器</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.monitor}
          </dd>
        </div>
      </dl>
    </section>
  );
}
