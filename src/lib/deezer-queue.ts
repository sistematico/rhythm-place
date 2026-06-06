// Module-level singleton — persists across requests in the same Node.js process.
// Guarantees only one Deezer request runs at a time, with a safety delay after each.
const POST_REQUEST_DELAY_MS = 2000;

let queueTail: Promise<void> = Promise.resolve();

export async function deezerQueued<T>(fn: () => Promise<T>): Promise<T> {
  const previous = queueTail;

  let resolveSlot!: () => void;
  queueTail = new Promise<void>((resolve) => {
    resolveSlot = resolve;
  });

  await previous;

  try {
    return await fn();
  } finally {
    setTimeout(resolveSlot, POST_REQUEST_DELAY_MS);
  }
}
