import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { randomBytes } from "crypto";

// otplib defaults to window: 0 — zero tolerance for clock drift or the
// few seconds it naturally takes a person to read a code and type it in,
// so a genuinely correct code can fail if it's checked a moment after the
// 30s step boundary. window: 1 accepts the previous/current/next step
// (~90s total), the standard tolerance recommended by TOTP implementations.
authenticator.options = { window: 1 };

@Injectable()
export class MfaService {
  generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, "MBN Health", secret);
    return { secret, otpauthUrl };
  }

  async generateQrCodeDataUrl(otpauthUrl: string) {
    return QRCode.toDataURL(otpauthUrl);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  generateRecoveryCodes(count = 8): string[] {
    return Array.from({ length: count }, () => randomBytes(5).toString("hex"));
  }
}
