export class MarketSyncTimeoutError extends Error {
  readonly code = "TIMEOUT" as const;

  constructor() {
    super("Market sync exceeded its configured runtime limit.");
    this.name = "MarketSyncTimeoutError";
  }
}

export async function runWithMarketSyncTimeout<Result>(
  operation: (signal: AbortSignal) => Promise<Result>,
  maxRunSeconds: number,
): Promise<Result> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutError = new MarketSyncTimeoutError();
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort(timeoutError);
      reject(timeoutError);
    }, maxRunSeconds * 1_000);
  });

  try {
    return await Promise.race([
      operation(controller.signal),
      timeoutPromise,
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
