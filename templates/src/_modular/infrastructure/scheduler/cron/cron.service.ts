import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_HOUR)
  handleHourly() {
    this.logger.log('Hourly cron job executed');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyCleanup() {
    this.logger.log('Daily cleanup cron job executed');
  }
}
