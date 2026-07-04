import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** No real SMTP/SES provider is wired in yet: with EMAIL_PROVIDER=console
 * (the default) this logs the intended send, so every caller is already
 * written against a real send and a real provider can be dropped into this
 * one method later without touching callers. */
@Injectable()
export class EmailService {
  private readonly logger = new Logger("Email");

  constructor(private readonly config: ConfigService) {}

  async send(to: string, subject: string, body: string) {
    const provider = this.config.get<string>("messaging.emailProvider");
    this.logger.log(`[EMAIL] provider=${provider ?? "console"} to=${to} subject="${subject}"\n${body}`);
  }
}
