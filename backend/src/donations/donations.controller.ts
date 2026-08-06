import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { DonationsService } from './donations.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donations: DonationsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Public donation presets and Stripe readiness' })
  getConfig() {
    return this.donations.getPublicConfig();
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe Checkout session for a donation' })
  @ApiOkResponse({ description: 'Checkout URL to redirect the donor' })
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.donations.createCheckoutSession(dto);
  }

  @Post('payment-intent')
  @ApiOperation({
    summary: 'Create PaymentIntent / Subscription secret for Stripe Payment Element',
  })
  createPaymentIntent(@Body() dto: CreateCheckoutDto) {
    return this.donations.createPaymentIntent(dto);
  }

  @Get('payment-intent/:paymentIntentId')
  @ApiOperation({ summary: 'Fetch PaymentIntent status (success page)' })
  getPaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.donations.getPaymentIntent(paymentIntentId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Fetch Checkout session status (success page)' })
  getSession(@Param('sessionId') sessionId: string) {
    return this.donations.getSession(sessionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    return this.donations.handleWebhook(req.rawBody, signature);
  }
}
