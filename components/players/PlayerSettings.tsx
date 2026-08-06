import type { Player } from "@/types/player";

interface PlayerSettingsProps {
  player: Player;
}

export default function PlayerSettings({ player }: PlayerSettingsProps) {
  return (
    <section
      aria-labelledby="player-settings-heading"
      className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-orange-400">本地模拟参数</p>
      <h2 id="player-settings-heading" className="mt-1 text-2xl font-bold">
        游戏设置
      </h2>

      <dl className="mt-6 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
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
          <dt className="text-zinc-500">缩放灵敏度</dt>
          <dd className="mt-1 font-semibold text-zinc-100">
            {player.zoomSensitivity}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">分辨率</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.resolution}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">画面比例</dt>
          <dd className="mt-1 break-words font-semibold text-zinc-100">
            {player.aspectRatio}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-zinc-500">模拟准星代码</dt>
          <dd className="mt-2 min-w-0">
            <code className="block max-w-full break-all rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-3 text-sm leading-6 whitespace-normal text-orange-200">
              {player.crosshairCode}
            </code>
          </dd>
        </div>
      </dl>
    </section>
  );
}
