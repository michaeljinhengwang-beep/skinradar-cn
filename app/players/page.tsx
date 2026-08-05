import PlayerExplorer from "@/components/players/PlayerExplorer";
import { mockPlayers } from "@/data/mock-players";

export default function PlayersPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-orange-400 uppercase">
          SkinRadar Players
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          职业选手配置
        </h1>
        <p className="mt-4 text-zinc-400">
          浏览虚构选手的模拟灵敏度、角色与外设配置，并通过本地筛选体验目录功能。
        </p>
      </div>

      <aside className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-4 text-sm leading-6 text-orange-100">
        <p className="font-semibold text-orange-300">模拟数据说明</p>
        <p className="mt-1">
          当前资料均为本地虚构模拟数据，不代表任何真实职业选手、战队或 HLTV
          信息。外设与参数不构成购买建议；接入真实数据前不得用于事实引用。
        </p>
      </aside>

      <PlayerExplorer players={mockPlayers} />
    </section>
  );
}
