import { Controller, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ok } from '@common/helpers/response.helper';
import { Request } from 'express';

@ApiTags('Auth / OAuth')
@Controller('auth/oauth')
export class OAuthController {
{{#includes oauthProviders "google"}}
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  googleAuth() {
    // Passport redirects — no body needed
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Req() req: Request) {
    return ok('Google login successful', req.user);
  }
{{/includes}}
{{#includes oauthProviders "github"}}

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Redirect to GitHub OAuth' })
  githubAuth() {
    // Passport redirects — no body needed
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  githubCallback(@Req() req: Request) {
    return ok('GitHub login successful', req.user);
  }
{{/includes}}
}
