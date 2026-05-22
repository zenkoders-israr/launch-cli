import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private userService: UserService,
    private config: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<{ secret: string; qrCodeDataUrl: string; otpAuthUrl: string }> {
    const user = await this.userService.findById(userId);
    const appName = this.config.get<string>('app.name') ?? 'App';

    const secret = authenticator.generateSecret(20);
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    // Store secret temporarily — user must verify before enabling
    await this.userService.update(userId, { twoFactorSecret: secret });

    return { secret, qrCodeDataUrl, otpAuthUrl };
  }

  async enableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Generate a 2FA secret first via GET /auth/2fa/setup');
    }
    if (!authenticator.verify({ token: code, secret: user.twoFactorSecret })) {
      throw new UnauthorizedException('Invalid TOTP code');
    }
    await this.userService.update(userId, { twoFactorEnabled: true });
  }

  async disableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }
    if (!authenticator.verify({ token: code, secret: user.twoFactorSecret })) {
      throw new UnauthorizedException('Invalid TOTP code');
    }
    await this.userService.update(userId, { twoFactorEnabled: false, twoFactorSecret: null });
  }

  verifyCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
  }
}
