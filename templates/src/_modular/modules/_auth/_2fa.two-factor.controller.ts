import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ok } from '@common/helpers/response.helper';

export class TwoFactorCodeDto {
  @IsString()
  @Length(6, 6)
  code: string;
}

@ApiTags('Auth / 2FA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth/2fa')
export class TwoFactorController {
  constructor(private twoFactorService: TwoFactorService) {}

  @Get('setup')
  @ApiOperation({ summary: 'Generate TOTP secret and QR code' })
  async setup(@CurrentUser() user: { id: string }) {
    const result = await this.twoFactorService.generateSecret(user.id);
    return ok('Scan the QR code with your authenticator app, then verify with POST /auth/2fa/enable', result);
  }

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA after verifying a TOTP code' })
  async enable(@CurrentUser() user: { id: string }, @Body() dto: TwoFactorCodeDto) {
    await this.twoFactorService.enableTwoFactor(user.id, dto.code);
    return ok('Two-factor authentication enabled', null);
  }

  @Delete('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA (requires valid TOTP code)' })
  async disable(@CurrentUser() user: { id: string }, @Body() dto: TwoFactorCodeDto) {
    await this.twoFactorService.disableTwoFactor(user.id, dto.code);
    return ok('Two-factor authentication disabled', null);
  }
}
