import { BadRequestException, Body, Controller, Headers, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Permission } from "@mbn/database";
import { BillingSubscriptionService } from "./billing-subscription.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("billing/subscription")
export class BillingSubscriptionController {
  constructor(private readonly billingSubscriptionService: BillingSubscriptionService) {}

  @Post("checkout")
  @RequirePermissions(Permission.SUBSCRIPTION_MANAGE)
  createCheckout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCheckoutSessionDto) {
    return this.billingSubscriptionService.createCheckoutSession(user.tenantId!, dto.plan, user.email);
  }

  @Post("portal")
  @RequirePermissions(Permission.SUBSCRIPTION_MANAGE)
  createPortal(@CurrentUser() user: AuthenticatedUser) {
    return this.billingSubscriptionService.createPortalSession(user.tenantId!);
  }

  @Public()
  @Post("webhook")
  async webhook(@Req() req: Request & { rawBody?: Buffer }, @Headers("stripe-signature") signature?: string) {
    if (!req.rawBody || !signature) throw new BadRequestException("Missing Stripe signature or body");
    return this.billingSubscriptionService.handleWebhook(req.rawBody, signature);
  }
}
