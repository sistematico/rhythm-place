// Module-level singletons — persist across requests in the same Node.js process.
// Each queue guarantees one operation at a time with a 2-second safety delay after each.
const POST_REQUEST_DELAY_MS = 2000;

function createQueue() {
  let tail: Promise<void> = Promise.resolve();

  return async function queued<T>(fn: () => Promise<T>): Promise<T> {
    const previous = tail;
    let resolveSlot!: () => void;
    tail = new Promise<void>((resolve) => {
      resolveSlot = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      setTimeout(resolveSlot, POST_REQUEST_DELAY_MS);
    }
  };
}

export const deezerQueued = createQueue();
export const downloadQueued = createQueue();
