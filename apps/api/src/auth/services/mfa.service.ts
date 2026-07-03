import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { randomBytes } from "crypto";

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
