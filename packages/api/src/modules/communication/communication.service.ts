import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaigns() {
    return this.prisma.communicationCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(data: any) {
    return this.prisma.communicationCampaign.create({
      data: {
        title: data.title,
        channel: data.channel || 'whatsapp',
        targetGroup: data.targetGroup || 'Active Leads',
        message: data.message,
        sentCount: data.sentCount ? Number(data.sentCount) : 1,
      },
    });
  }

  async getWhatsAppLogs() {
    return this.prisma.whatsAppLog.findMany({ orderBy: { sentAt: 'desc' } });
  }

  async getCallLogs() {
    return this.prisma.callLog.findMany({ orderBy: { calledAt: 'desc' } });
  }

  async createCallLog(data: any) {
    return this.prisma.callLog.create({
      data: {
        callerName: data.callerName,
        phone: data.phone,
        durationSec: Number(data.durationSec || 60),
        notes: data.notes || '',
      },
    });
  }
}
