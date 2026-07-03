import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { SubscriptionPlan, SubscriptionStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";

const PLAN_STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: SubscriptionStatus.ACTIVE,
  trialing: SubscriptionStatus.TRIALING,
  past_due: SubscriptionStatus.PAST_DUE,
  canceled: SubscriptionStatus.CANCELLED,
  unpaid: SubscriptionStatus.PAST_DUE,
  incomplete: SubscriptionStatus.TRIALING,
  incomplete_expired: SubscriptionStatus.CANCELLED,
  paused: SubscriptionStatus.PAST_DUE,
};

/**
 * Stripe Checkout + webhook integration for subscription billing. With no
 * STRIPE_SECRET_KEY configured, checkout/portal endpoints return a clear
 * "not configured yet" error rather than silently no-op'ing — unlike a
 * reminder message, a broken payment flow should never look like it worked.
 */
@Injectable()
export class BillingSubscriptionService {
  private readonly logger = new Logger("BillingSubscription");
  private client: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getClient(): Stripe {
    const secretKey = this.config.get<string>("stripe.secretKey");
    if (!secretKey) {
      throw new BadRequestException(
        "Stripe is not configured for this platform yet. Set STRIPE_SECRET_KEY to enable billing.",
      );
    }
    if (!this.client) this.client = new Stripe(secretKey);
    return this.client;
  }

  private priceIdForPlan(plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE"): string {
    const key =
      plan === "STARTER"
        ? "stripe.priceIdStarter"
        : plan === "PROFESSIONAL"
          ? "stripe.priceIdProfessional"
          : "stripe.priceIdEnterprise";
    const priceId = this.config.get<string>(key);
    if (!priceId) {
      throw new BadRequestException(`No Stripe price configured for the ${plan} plan yet.`);
    }
    return priceId;
  }

  async createCheckoutSession(tenantId: string, plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE", billingEmail: string) {
    const stripe = this.getClient();
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!subscription) throw new NotFoundException("Subscription record not found for this tenant");

    let stripeCustomerId = subscription.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: billingEmail,
        metadata: { tenantId },
      });
      stripeCustomerId = customer.id;
      await this.prisma.subscription.update({ where: { tenantId }, data: { stripeCustomerId } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: this.priceIdForPlan(plan), quantity: 1 }],
      success_url: this.config.get<string>("stripe.checkoutSuccessUrl")!,
      cancel_url: this.config.get<string>("stripe.checkoutCancelUrl")!,
      metadata: { tenantId, plan },
      subscription_data: { metadata: { tenantId, plan } },
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    const stripe = this.getClient();
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException("This clinic has no Stripe customer yet — start a checkout first.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: this.config.get<string>("stripe.checkoutSuccessUrl")!,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const stripe = this.getClient();
    const webhookSecret = this.config.get<string>("stripe.webhookSecret");
    if (!webhookSecret) throw new BadRequestException("Stripe webhook secret not configured");

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException("Invalid Stripe webhook signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan as SubscriptionPlan | undefined;
        if (tenantId && session.subscription) {
          await this.prisma.subscription.update({
            where: { tenantId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              status: SubscriptionStatus.ACTIVE,
              plan: plan ?? undefined,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;
        if (tenantId) {
          const currentPeriodEnd = sub.items.data[0]?.current_period_end;
          await this.prisma.subscription.update({
            where: { tenantId },
            data: {
              status: PLAN_STATUS_MAP[sub.status] ?? SubscriptionStatus.ACTIVE,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              stripePriceId: sub.items.data[0]?.price?.id,
              currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;
        if (tenantId) {
          await this.prisma.subscription.update({
            where: { tenantId },
            data: { status: SubscriptionStatus.CANCELLED },
          });
        }
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }
}
