import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

/** Stripe zero-decimal currencies — amount is already the smallest unit. */
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx',
  'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

interface DemoSession {
  id: string;
  status: 'complete';
  paymentStatus: 'paid';
  mode: 'payment' | 'subscription';
  amountTotal: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: number;
}

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);
  private stripe: Stripe | null = null;
  private readonly demoSessions = new Map<string, DemoSession>();

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY')?.trim();
    if (key && !key.includes('...')) {
      this.stripe = new Stripe(key);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set — running donations in DEMO mode (simulated payments).',
      );
    }
  }

  isConfigured() {
    return Boolean(this.stripe);
  }

  isDemoMode() {
    return !this.isConfigured();
  }

  getPublicConfig() {
    return {
      configured: this.isConfigured(),
      demoMode: this.isDemoMode(),
      publishableKey: this.config.get<string>('STRIPE_PUBLISHABLE_KEY')?.trim() || null,
      currencies: ['usd', 'pkr', 'eur', 'gbp'] as const,
      presets: {
        usd: [10, 25, 50, 100],
        pkr: [2776, 6941, 13882, 27764],
        eur: [10, 25, 50, 100],
        gbp: [10, 20, 40, 80],
      },
      intervals: [
        { id: 'month', label: 'Monthly' },
        { id: 'week', label: 'Weekly' },
        { id: 'year', label: 'Yearly' },
      ] as const,
    };
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Donations are not configured. Add STRIPE_SECRET_KEY to the API environment.',
      );
    }
    return this.stripe;
  }

  private toUnitAmount(amount: number, currency: string): number {
    const cur = currency.toLowerCase();
    if (ZERO_DECIMAL.has(cur)) return Math.round(amount);
    return Math.round(amount * 100);
  }

  private frontendOrigin(): string {
    return (
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      this.config.get<string>('CORS_ORIGINS')?.split(',')[0]?.trim() ||
      'http://localhost:3010'
    );
  }

  private pruneDemoSessions() {
    const cutoff = Date.now() - 1000 * 60 * 60 * 6;
    for (const [id, session] of this.demoSessions) {
      if (session.createdAt < cutoff) this.demoSessions.delete(id);
    }
  }

  private createDemoSession(dto: CreateCheckoutDto) {
    this.pruneDemoSessions();
    const currency = dto.currency.toLowerCase();
    const amountTotal = this.toUnitAmount(dto.amount, currency);
    const id = `cs_demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const session: DemoSession = {
      id,
      status: 'complete',
      paymentStatus: 'paid',
      mode: dto.mode === 'recurring' ? 'subscription' : 'payment',
      amountTotal,
      currency,
      customerEmail: dto.customerEmail?.trim() || null,
      customerName: dto.customerName?.trim() || null,
      createdAt: Date.now(),
    };
    this.demoSessions.set(id, session);
    this.logger.log(
      `DEMO donation recorded: ${id} ${dto.amount} ${currency} mode=${dto.mode} email=${session.customerEmail ?? 'n/a'}`,
    );
    const origin = this.frontendOrigin();
    return {
      url: `${origin}/donate/success?session_id=${id}&demo=1`,
      sessionId: id,
      demo: true as const,
    };
  }

  async createCheckoutSession(dto: CreateCheckoutDto) {
    if (this.isDemoMode()) {
      return this.createDemoSession(dto);
    }

    const stripe = this.requireStripe();
    const currency = dto.currency.toLowerCase();
    const unitAmount = this.toUnitAmount(dto.amount, currency);
    if (unitAmount < 1) throw new BadRequestException('Amount too small');

    const recurring = dto.mode === 'recurring';
    const interval = dto.interval ?? 'month';
    const origin = this.frontendOrigin();
    const dedication =
      dto.dedicate && dto.dedicationName?.trim()
        ? dto.dedicationName.trim()
        : dto.dedicate
          ? 'Dedicated donation'
          : '';

    const productName = recurring
      ? 'QuranPilot recurring donation'
      : 'QuranPilot donation';
    const description = dedication
      ? `Thank you for supporting QuranPilot. Dedication: ${dedication}`
      : 'Help millions connect with the Quran through QuranPilot.';

    const metadata: Stripe.MetadataParam = {
      source: 'quranpilot',
      mode: dto.mode,
      amount_display: String(dto.amount),
      currency,
      dedicate: dto.dedicate ? 'true' : 'false',
      dedication_name: dedication,
      customer_name: dto.customerName?.trim() || '',
      country: dto.country?.trim() || '',
      hide_name: dto.hideName ? 'true' : 'false',
      as_organization: dto.asOrganization ? 'true' : 'false',
      organization_name: dto.organizationName?.trim() || '',
      city: dto.city?.trim() || '',
      state: dto.state?.trim() || '',
      zip: dto.zip?.trim() || '',
    };

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: unitAmount,
        product_data: {
          name: productName,
          description,
        },
        ...(recurring ? { recurring: { interval } } : {}),
      },
    };

    const session = await stripe.checkout.sessions.create({
      mode: recurring ? 'subscription' : 'payment',
      line_items: [lineItem],
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/checkout?canceled=1`,
      metadata,
      customer_email: dto.customerEmail?.trim() || undefined,
      ...(recurring
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    if (!session.url) {
      throw new ServiceUnavailableException('Stripe did not return a checkout URL');
    }

    return { url: session.url, sessionId: session.id, demo: false as const };
  }

  private buildMetadata(dto: CreateCheckoutDto, channel: string): Stripe.MetadataParam {
    const currency = dto.currency.toLowerCase();
    const dedication =
      dto.dedicate && dto.dedicationName?.trim()
        ? dto.dedicationName.trim()
        : dto.dedicate
          ? 'Dedicated donation'
          : '';

    return {
      source: 'quranpilot',
      mode: dto.mode,
      channel,
      amount_display: String(dto.amount),
      currency,
      dedicate: dto.dedicate ? 'true' : 'false',
      dedication_name: dedication,
      customer_name: dto.customerName?.trim() || '',
      country: dto.country?.trim() || '',
      hide_name: dto.hideName ? 'true' : 'false',
      as_organization: dto.asOrganization ? 'true' : 'false',
      organization_name: dto.organizationName?.trim() || '',
      city: dto.city?.trim() || '',
      state: dto.state?.trim() || '',
      zip: dto.zip?.trim() || '',
    };
  }

  private extractClientSecretFromInvoice(invoice: Stripe.Invoice | string | null): string | null {
    if (!invoice || typeof invoice === 'string') return null;
    const withPi = invoice as Stripe.Invoice & {
      payment_intent?: string | Stripe.PaymentIntent | null;
      confirmation_secret?: { client_secret?: string | null } | null;
    };
    if (withPi.confirmation_secret?.client_secret) {
      return withPi.confirmation_secret.client_secret;
    }
    const pi = withPi.payment_intent;
    if (pi && typeof pi === 'object' && pi.client_secret) return pi.client_secret;
    return null;
  }

  /**
   * Create a client secret for Stripe Payment Element (primary on-site gateway).
   * One-time → PaymentIntent; recurring → incomplete Subscription invoice.
   */
  async createPaymentIntent(dto: CreateCheckoutDto) {
    if (this.isDemoMode()) {
      const currency = dto.currency.toLowerCase();
      const unitAmount = this.toUnitAmount(dto.amount, currency);
      const paymentIntentId = `pi_demo_${Date.now().toString(36)}`;
      const sessionId = `cs_${paymentIntentId}`;
      this.demoSessions.set(sessionId, {
        id: sessionId,
        status: 'complete',
        paymentStatus: 'paid',
        mode: dto.mode === 'recurring' ? 'subscription' : 'payment',
        amountTotal: unitAmount,
        currency,
        customerEmail: dto.customerEmail?.trim() || null,
        customerName: dto.customerName?.trim() || null,
        createdAt: Date.now(),
      });
      this.logger.log(`DEMO PaymentIntent: ${paymentIntentId} ${dto.amount} ${currency}`);
      return {
        clientSecret: `${paymentIntentId}_secret_demo`,
        paymentIntentId,
        amount: unitAmount,
        currency,
        mode: dto.mode,
        demo: true as const,
      };
    }

    const stripe = this.requireStripe();
    const currency = dto.currency.toLowerCase();
    const unitAmount = this.toUnitAmount(dto.amount, currency);
    if (unitAmount < 1) throw new BadRequestException('Amount too small');

    const metadata = this.buildMetadata(dto, 'payment_element');
    const productName =
      dto.mode === 'recurring'
        ? 'QuranPilot recurring donation'
        : 'QuranPilot donation';
    const description = metadata.dedication_name
      ? `Thank you for supporting QuranPilot. Dedication: ${metadata.dedication_name}`
      : 'Help millions connect with the Quran through QuranPilot.';

    if (dto.mode === 'recurring') {
      const interval = dto.interval ?? 'month';
      const customer = await stripe.customers.create({
        email: dto.customerEmail?.trim() || undefined,
        name: dto.customerName?.trim() || undefined,
        metadata,
        ...(dto.address?.trim()
          ? {
              address: {
                line1: dto.address.trim(),
                city: dto.city?.trim() || undefined,
                state: dto.state?.trim() || undefined,
                postal_code: dto.zip?.trim() || undefined,
              },
            }
          : {}),
      });

      const product = await stripe.products.create({
        name: productName,
        metadata,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency,
              unit_amount: unitAmount,
              product: product.id,
              recurring: { interval },
            },
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card'],
        },
        metadata,
        expand: ['latest_invoice.payment_intent', 'latest_invoice.confirmation_secret'],
      });

      const clientSecret = this.extractClientSecretFromInvoice(
        subscription.latest_invoice as Stripe.Invoice | string | null,
      );
      if (!clientSecret) {
        throw new ServiceUnavailableException(
          'Stripe subscription did not return a payment client secret',
        );
      }

      const invoice = subscription.latest_invoice;
      let paymentIntentId = subscription.id;
      if (invoice && typeof invoice !== 'string') {
        const withPi = invoice as Stripe.Invoice & {
          payment_intent?: string | Stripe.PaymentIntent | null;
        };
        if (withPi.payment_intent && typeof withPi.payment_intent === 'object') {
          paymentIntentId = withPi.payment_intent.id;
        } else if (typeof withPi.payment_intent === 'string') {
          paymentIntentId = withPi.payment_intent;
        }
      }

      return {
        clientSecret,
        paymentIntentId,
        subscriptionId: subscription.id,
        amount: unitAmount,
        currency,
        mode: 'recurring' as const,
        demo: false as const,
      };
    }

    const intent = await stripe.paymentIntents.create({
      amount: unitAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: dto.customerEmail?.trim() || undefined,
      description,
      metadata,
    });

    if (!intent.client_secret) {
      throw new ServiceUnavailableException('Stripe did not return a client secret');
    }

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: unitAmount,
      currency,
      mode: 'once' as const,
      demo: false as const,
    };
  }

  async getPaymentIntent(paymentIntentId: string) {
    if (paymentIntentId.startsWith('pi_demo_')) {
      const demo = this.demoSessions.get(`cs_${paymentIntentId}`);
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: demo?.amountTotal ?? null,
        currency: demo?.currency ?? null,
        customerEmail: demo?.customerEmail ?? null,
        demo: true,
      };
    }

    if (this.isDemoMode()) {
      throw new BadRequestException('Invalid demo payment intent id');
    }

    const stripe = this.requireStripe();
    if (!paymentIntentId?.startsWith('pi_')) {
      throw new BadRequestException('Invalid payment intent id');
    }
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: intent.id,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
      customerEmail: intent.receipt_email,
      demo: false,
    };
  }

  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    if (this.isDemoMode()) {
      return { received: true, demo: true };
    }
    const stripe = this.requireStripe();
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim();
    if (!secret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET is not set');
    }
    if (!rawBody?.length || !signature) {
      throw new BadRequestException('Missing webhook body or signature');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid Stripe signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        this.logger.log(
          `Donation checkout completed: ${session.id} mode=${session.mode} amount=${session.amount_total} ${session.currency}`,
        );
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        this.logger.log(
          `Donation payment succeeded: ${intent.id} amount=${intent.amount} ${intent.currency}`,
        );
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.log(`Recurring donation invoice paid: ${invoice.id}`);
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  async getSession(sessionId: string) {
    if (sessionId.startsWith('cs_demo_') || sessionId.startsWith('cs_pi_demo_')) {
      const demo = this.demoSessions.get(sessionId);
      if (!demo) {
        // Still return a friendly completed demo payload
        return {
          id: sessionId,
          status: 'complete',
          paymentStatus: 'paid',
          mode: 'payment',
          amountTotal: null,
          currency: null,
          customerEmail: null,
          demo: true,
        };
      }
      return {
        id: demo.id,
        status: demo.status,
        paymentStatus: demo.paymentStatus,
        mode: demo.mode,
        amountTotal: demo.amountTotal,
        currency: demo.currency,
        customerEmail: demo.customerEmail,
        demo: true,
      };
    }

    if (this.isDemoMode()) {
      throw new BadRequestException('Invalid demo session id');
    }

    const stripe = this.requireStripe();
    if (!sessionId?.startsWith('cs_')) {
      throw new BadRequestException('Invalid session id');
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      mode: session.mode,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? null,
      demo: false,
    };
  }
}
