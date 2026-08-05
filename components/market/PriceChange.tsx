type PriceChangeProps = {
  value: number;
};

export default function PriceChange({ value }: PriceChangeProps) {
  if (value > 0) {
    return (
      <span className="font-semibold text-emerald-400">
        上涨 +{value.toFixed(1)}%
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="font-semibold text-red-400">
        下跌 {value.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="font-semibold text-zinc-300">无变化 0.0%</span>
  );
}
