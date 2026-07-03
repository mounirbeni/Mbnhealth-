import { Module } from "@nestjs/common";
import { BillingSubscriptionService } from "./billing-subscription.service";
import { BillingSubscriptionController } from "./billing-subscription.controller";

@Module({
  providers: [BillingSubscriptionService],
  controllers: [BillingSubscriptionController],
})
export class BillingSubscriptionModule {}
