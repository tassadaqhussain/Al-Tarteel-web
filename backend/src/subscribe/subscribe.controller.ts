import { Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscribeService } from './subscribe.service';

@ApiTags('subscribe')
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post()
  subscribe(@Body() body: { email?: string; source?: string; locale?: string }) {
    return this.subscribeService.subscribe(body?.email ?? '', body?.source, body?.locale);
  }

  @Get('confirm')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async confirm(@Query('token') token = '') {
    const ok = await this.subscribeService.confirm(token);
    const home = (process.env.FRONTEND_URL || 'https://quranpilot.com').replace(/\/$/, '');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>QuranPilot Subscription</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:64px auto;padding:0 20px;color:#0f172a;text-align:center"><h1 style="color:#064e3b">${ok ? 'Subscription Confirmed' : 'Invalid or Expired Link'}</h1><p style="line-height:1.6">${ok ? 'JazakAllahu khayran! You will receive your daily Quran ayah &amp; reflection.' : 'We could not find this confirmation link.'}</p><p><a href="${home}" style="display:inline-block;margin-top:12px;background:#064e3b;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600">Return to QuranPilot</a></p></body></html>`;
  }

  @Get('unsubscribe')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async unsubscribe(@Query('token') token = '') {
    const ok = await this.subscribeService.unsubscribe(token);
    const home = (process.env.FRONTEND_URL || 'https://quranpilot.com').replace(/\/$/, '');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Unsubscribed — QuranPilot</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:64px auto;padding:0 20px;color:#0f172a;text-align:center"><h1 style="color:#064e3b">${ok ? 'Unsubscribed' : 'Link Not Found'}</h1><p style="line-height:1.6">${ok ? 'You have been unsubscribed from Daily Quran Reflection emails.' : 'This unsubscribe link is invalid.'}</p><p><a href="${home}" style="display:inline-block;margin-top:12px;background:#064e3b;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600">Return to QuranPilot</a></p></body></html>`;
  }
}
