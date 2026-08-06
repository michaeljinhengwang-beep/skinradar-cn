import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "登录功能开发中",
  description:
    "SkinRadar 登录与账户功能尚未开放；当前页面不收集邮箱、密码或其他个人信息。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
        SkinRadar
      </p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">登录</h1>
      <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
        账户、收藏与价格提醒功能将在后续阶段提供，当前不提供登录服务。
      </p>
      <p className="mt-8 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-orange-400">
        正在开发中
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-orange-500/40 px-4 py-2.5 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          返回首页
        </Link>
      </div>
    </section>
  );
}
