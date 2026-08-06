import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerEquipment from "@/components/players/PlayerEquipment";
import PlayerSettings from "@/components/players/PlayerSettings";
import PlayerStatusBadge from "@/components/players/PlayerStatusBadge";
import { mockPlayers } from "@/data/mock-players";
import { getPlayerById } from "@/lib/players";

type PlayerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return mockPlayers.map((player) => ({ id: player.id }));
}

export async function generateMetadata({
  params,
}: PlayerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayerById(mockPlayers, id);

  if (!player) {
    return {
      title: "模拟选手未找到",
      description: "未找到对应的 SkinRadar 本地模拟选手内容。",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${player.nickname} 模拟选手详情`,
    description: `查看 ${player.nickname} 的 SkinRadar 本地模拟选手详情；内容不代表真实职业选手、战队或 HLTV 信息。`,
  };
}

function formatDemoUpdatedAt(updatedAt: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(updatedAt));
}

export default async function PlayerDetailPage({
  params,
}: PlayerDetailPageProps) {
  const { id } = await params;
  const player = getPlayerById(mockPlayers, id);

  if (!player) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/players"
        className="inline-flex text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
      >
        ← 返回职业选手目录
      </Link>

      <aside
        aria-label="模拟选手数据说明"
        className="mt-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5 text-sm leading-7 text-orange-100"
      >
        <p className="font-semibold text-orange-300">本地模拟数据说明</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>本页资料均为本地虚构模拟数据，不代表真实职业选手、战队或 HLTV 信息。</li>
          <li>模拟外设配置不构成购买建议。</li>
          <li>模拟准星代码不保证能在真实 CS2 客户端中使用。</li>
          <li>全部内容仅供界面开发，不应用作事实引用。</li>
        </ul>
      </aside>

      <article className="mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex min-h-72 min-w-0 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/40 px-5 py-12 text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-3xl font-bold text-orange-300">
              {player.nickname.slice(0, 1)}
            </span>
            <p className="mt-5 break-words text-3xl font-bold text-zinc-100">
              {player.nickname}
            </p>
            <p className="mt-2 text-sm font-semibold tracking-[0.2em] text-orange-300 uppercase">
              模拟数据
            </p>
          </div>

          <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-300">
                虚构选手资料
              </span>
              <PlayerStatusBadge status={player.status} />
            </div>

            <p className="mt-6 break-words text-sm font-semibold text-orange-400">
              {player.team}
            </p>
            <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">
              {player.nickname}
            </h1>
            <p className="mt-2 break-words text-zinc-400">
              模拟姓名：{player.realName}
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-zinc-500">模拟战队</dt>
                <dd className="mt-1 break-words font-semibold text-zinc-200">
                  {player.team}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">国籍</dt>
                <dd className="mt-1 break-words font-semibold text-zinc-200">
                  {player.nationality}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">地区</dt>
                <dd className="mt-1 break-words font-semibold text-zinc-200">
                  {player.region}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-500">状态</dt>
                <dd className="mt-1 font-semibold text-zinc-200">
                  {player.status}
                </dd>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-zinc-500">角色</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {player.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-200"
                    >
                      {role}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-zinc-500">固定演示更新时间（UTC）</dt>
                <dd className="mt-1 break-words text-zinc-300">
                  <time dateTime={player.updatedAt}>
                    {formatDemoUpdatedAt(player.updatedAt)}
                  </time>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <PlayerSettings player={player} />
          <PlayerEquipment player={player} />
        </div>
      </article>
    </div>
  );
}
