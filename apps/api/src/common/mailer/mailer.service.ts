import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// No SMTP credentials required to run this app: with SMTP_HOST unset (the
// default), sends are logged instead of transmitted, so every flow that
// depends on email (password reset, etc.) is fully wired end to end and
// ready for a real SMTP provider to be dropped in via env vars.
@Injectable()
export class MailerService {
  private readonly logger = new Logger("Mailer");
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): nodemailer.Transporter | null {
    const host = this.config.get<string>("smtp.host");
    if (!host) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>("smtp.port"),
        secure: this.config.get<boolean>("smtp.secure"),
        auth: this.config.get<string>("smtp.user")
          ? { user: this.config.get<string>("smtp.user"), pass: this.config.get<string>("smtp.pass") }
          : undefined,
      });
    }
    return this.transporter;
  }

  async send({ to, subject, html, text }: SendMailInput): Promise<void> {
    const transporter = this.getTransporter();
    const from = this.config.get<string>("smtp.from");

    if (!transporter) {
      this.logger.log(
        `[EMAIL:SIMULATED] to=${to} subject="${subject}" — set SMTP_HOST to send for real\n${text}`,
      );
      return;
    }

    await transporter.sendMail({ from, to, subject, html, text });
    this.logger.log(`[EMAIL:SENT] to=${to} subject="${subject}"`);
  }
}
