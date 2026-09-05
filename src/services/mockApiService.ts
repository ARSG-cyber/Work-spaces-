export interface MockApiOptions {
  delayMs?: number;
  failureRate?: number;
}

export async function simulateNetworkRequest<T>(
  action: () => T,
  options: MockApiOptions = {}
): Promise<T> {
  const delay = options.delayMs ?? 300;
  const failureRate = options.failureRate ?? 0;

  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      // Simulate random network failure if failure rate is set
      if (failureRate > 0 && Math.random() < failureRate) {
        reject(new Error('Simulated network failure: Server connection timed out.'));
        return;
      }
      try {
        const result = action();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}
