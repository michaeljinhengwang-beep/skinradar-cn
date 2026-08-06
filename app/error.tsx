"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-[0.3em] text-orange-500 uppercase">
          SkinRadar
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          页面暂时出现问题
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          当前内容未能正常显示。你可以重试，或返回首页继续浏览其他演示模块。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            重试
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            返回首页
          </Link>
        </div>
      </div>
    </section>
  );
}
