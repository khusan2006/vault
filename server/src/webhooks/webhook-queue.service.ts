import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

interface WebhookJob {
  id: string;
  topic: string;
  shop: string;
  payload: unknown;
  handler: () => Promise<void>;
  retries: number;
  createdAt: Date;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

@Injectable()
export class WebhookQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(WebhookQueueService.name);
  private readonly queue: WebhookJob[] = [];
  private processing = false;
  private shutdownRequested = false;

  async enqueue(
    topic: string,
    shop: string,
    payload: unknown,
    handler: () => Promise<void>,
  ): Promise<void> {
    const job: WebhookJob = {
      id: `${shop}-${topic}-${Date.now()}`,
      topic,
      shop,
      payload,
      handler,
      retries: 0,
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.logger.debug(`Enqueued webhook job: ${job.id}`);

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.shutdownRequested) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && !this.shutdownRequested) {
      const job = this.queue.shift()!;

      try {
        await job.handler();
        this.logger.log(`Processed webhook job: ${job.id}`);
      } catch (error) {
        this.logger.error(`Failed to process webhook job: ${job.id}`, error);

        if (job.retries < MAX_RETRIES) {
          job.retries++;
          this.logger.warn(`Retrying job ${job.id} (attempt ${job.retries}/${MAX_RETRIES})`);

          setTimeout(() => {
            this.queue.push(job);
            this.processQueue();
          }, RETRY_DELAY_MS * job.retries);
        } else {
          this.logger.error(`Job ${job.id} failed after ${MAX_RETRIES} retries`);
        }
      }
    }

    this.processing = false;
  }

  onModuleDestroy(): void {
    this.shutdownRequested = true;
    this.logger.log(`Shutting down with ${this.queue.length} jobs remaining`);
  }
}
