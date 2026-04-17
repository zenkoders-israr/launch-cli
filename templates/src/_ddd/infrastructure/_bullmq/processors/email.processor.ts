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
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);
    // TODO: Integrate with mailer service
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.log(`Email sent to ${job.data.to}`);
  }
}
