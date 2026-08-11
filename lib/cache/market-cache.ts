export const DEFAULT_MARKET_CACHE_TTL_SECONDS = 300;

export type MarketCacheEnvironment = Readonly<
  Record<string, string | undefined>
>;

export function resolveMarketCacheTtlSeconds(value?: string | number) {
  if (value === undefined || value === "") {
    return DEFAULT_MARKET_CACHE_TTL_SECONDS;
  }

  const parsedValue =
    typeof value === "number" ? value : Number(value.trim());

  if (
    !Number.isFinite(parsedValue) ||
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return DEFAULT_MARKET_CACHE_TTL_SECONDS;
  }

  return parsedValue;
}

export function getMarketCacheTtlSeconds(
  environment: MarketCacheEnvironment = process.env,
) {
  return resolveMarketCacheTtlSeconds(
    environment.MARKET_CACHE_TTL_SECONDS,
  );
}

export function getMarketCacheExpiresAt(
  fetchedAt: string,
  ttlSeconds: number,
) {
  const fetchedAtTime = Date.parse(fetchedAt);
  const normalizedTtl = resolveMarketCacheTtlSeconds(ttlSeconds);

  if (!Number.isFinite(fetchedAtTime)) {
    throw new TypeError("Market cache fetchedAt must be a valid timestamp.");
  }

  return new Date(fetchedAtTime + normalizedTtl * 1_000).toISOString();
}

export function isMarketCacheFresh(
  fetchedAt: string,
  ttlSeconds: number,
  currentTime: Date,
) {
  const fetchedAtTime = Date.parse(fetchedAt);
  const currentTimestamp = currentTime.getTime();

  if (
    !Number.isFinite(fetchedAtTime) ||
    !Number.isFinite(currentTimestamp)
  ) {
    return false;
  }

  const expiresAtTime = Date.parse(
    getMarketCacheExpiresAt(fetchedAt, ttlSeconds),
  );
  return currentTimestamp < expiresAtTime;
}
