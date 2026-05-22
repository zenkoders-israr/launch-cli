import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../queue.module';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} → ${job.data.to}`);
    // TODO: Inject and call MailService here
    // jobId is set to a hash of (to + subject) at enqueue time — BullMQ deduplicates automatically
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.logger.log(`Email dispatched to ${job.data.to}`);
  }
}
