import { Queue } from 'bullmq';
import { createHash } from 'crypto';

/**
 * Enqueue a job with a deterministic jobId to prevent duplicate processing.
 * BullMQ skips adding a job if a job with the same ID already exists in the queue.
 */
export async function enqueueUnique<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queue: Queue<any>,
  name: string,
  data: T,
  dedupeKey?: string,
): Promise<void> {
  const jobId = dedupeKey ?? createHash('sha256').update(JSON.stringify(data)).digest('hex');
  await queue.add(name, data, { jobId });
}
