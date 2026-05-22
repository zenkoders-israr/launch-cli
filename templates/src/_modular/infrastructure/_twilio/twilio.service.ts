import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class TwilioService implements OnModuleInit {
  private client: Twilio.Twilio;
  private fromNumber: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = Twilio(
      this.config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
    );
    this.fromNumber = this.config.getOrThrow<string>('TWILIO_FROM_NUMBER');
  }

  /** Send a plain SMS */
  async sendSms(to: string, body: string): Promise<string> {
    const msg = await this.client.messages.create({ to, from: this.fromNumber, body });
    this.logger.log(`SMS sent to ${to} — SID: ${msg.sid}`);
    return msg.sid;
  }

  /** Send a numeric OTP via SMS */
  async sendOtp(to: string, otp: string): Promise<string> {
    return this.sendSms(to, `Your verification code is: ${otp}. Valid for 10 minutes.`);
  }

  /** Start Twilio Verify flow (managed OTP — no storage needed) */
  async startVerification(to: string): Promise<void> {
    const serviceSid = this.config.getOrThrow<string>('TWILIO_VERIFY_SERVICE_SID');
    await this.client.verify.v2.services(serviceSid).verifications.create({
      to,
      channel: 'sms',
    });
    this.logger.log(`Twilio Verify started for ${to}`);
  }

  /** Check Twilio Verify OTP — returns true if approved */
  async checkVerification(to: string, code: string): Promise<boolean> {
    const serviceSid = this.config.getOrThrow<string>('TWILIO_VERIFY_SERVICE_SID');
    const result = await this.client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to, code });
    return result.status === 'approved';
  }
}
