import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateInquiryStatusDto } from "./dto/update-inquiry-status.dto";
import { UpdateListingStatusDto } from "./dto/update-listing-status.dto";

@Injectable()
export class DirectoryAdminService {
  constructor(private readonly prisma: PrismaService) {}

  listListings(status?: string) {
    return this.prisma.clinicListing.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { inquiries: true, doctors: true, photos: true } } },
    });
  }

  async updateListingStatus(id: string, dto: UpdateListingStatusDto) {
    const listing = await this.prisma.clinicListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    return this.prisma.clinicListing.update({
      where: { id },
      data: { status: dto.status, verifiedAt: dto.status === "ACTIVE" ? new Date() : listing.verifiedAt },
    });
  }

  listInquiries(status?: string) {
    return this.prisma.clinicListingInquiry.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { createdAt: "desc" },
      include: { clinicListing: { select: { slug: true, name: true, city: true, phone: true, email: true } } },
    });
  }

  async updateInquiryStatus(id: string, dto: UpdateInquiryStatusDto) {
    const inquiry = await this.prisma.clinicListingInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");
    return this.prisma.clinicListingInquiry.update({
      where: { id },
      data: { status: dto.status, reviewNote: dto.reviewNote ?? inquiry.reviewNote, reviewedAt: new Date() },
    });
  }
}
