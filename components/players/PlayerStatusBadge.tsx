import type { PlayerStatus } from "@/types/player";

interface PlayerStatusBadgeProps {
  status: PlayerStatus;
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

export default function PlayerStatusBadge({
  status,
}: PlayerStatusBadgeProps) {
  const presentation = STATUS_PRESENTATION[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}
