import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { ConfirmUploadDto, RequestUploadUrlDto } from "./dto/uploads.dto";

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.config.get<string>("s3.bucket")!;
    this.s3 = new S3Client({
      endpoint: this.config.get<string>("s3.endpoint"),
      region: this.config.get<string>("s3.region"),
      forcePathStyle: this.config.get<boolean>("s3.forcePathStyle"),
      credentials: {
        accessKeyId: this.config.get<string>("s3.accessKeyId") ?? "",
        secretAccessKey: this.config.get<string>("s3.secretAccessKey") ?? "",
      },
    });
  }

  async requestUploadUrl(tenantId: string, dto: RequestUploadUrlDto) {
    const key = `${tenantId}/${randomUUID()}-${dto.fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { uploadUrl, key };
  }

  async confirmUpload(tenantId: string, dto: ConfirmUploadDto, uploadedById: string) {
    return this.prisma.attachment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        fileName: dto.fileName,
        fileUrl: dto.key,
        fileType: dto.contentType,
        fileSizeBytes: dto.fileSizeBytes,
        category: dto.category,
        uploadedById,
      },
    });
  }

  async getDownloadUrl(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }
}
