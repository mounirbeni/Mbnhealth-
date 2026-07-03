import { Controller, Get, Headers, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../common/decorators/public.decorator";
import { RemindersService } from "./reminders.service";

/**
 * Invoked by Vercel Cron (see vercel.json) instead of an in-process
 * @nestjs/schedule cron job, since a serverless function has no persistent
 * process to keep a scheduler alive in. Vercel sends
 * `Authorization: Bearer <CRON_SECRET>` on its own invocations; this route
 * rejects anything that doesn't present that secret.
 */
@Controller("cron/reminders")
export class RemindersController {
  private readonly logger = new Logger("RemindersCron");

  constructor(
    private readonly remindersService: RemindersService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  async trigger(@Headers("authorization") authHeader: string | undefined) {
    const secret = this.config.get<string>("cronSecret");
    if (secret && authHeader !== `Bearer ${secret}`) {
      throw new UnauthorizedException("Invalid cron secret");
    }
    if (!secret) {
      this.logger.warn("CRON_SECRET is not configured; the reminders endpoint is unauthenticated");
    }
    return this.remindersService.runDueReminders();
  }
}
