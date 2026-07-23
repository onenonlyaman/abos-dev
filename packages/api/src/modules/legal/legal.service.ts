import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  async getContracts(projectId?: string) {
    return this.prisma.contractAgreement.findMany({
      where: projectId ? { projectId } : undefined,
    });
  }

  async getLandRecords(projectId?: string) {
    return this.prisma.landRecord.findMany({
      where: projectId ? { projectId } : undefined,
    });
  }

  async createLandRecord(data: any) {
    let projectId = data.projectId;
    if (!projectId) {
      const p = await this.prisma.project.findFirst();
      if (p) projectId = p.id;
    }
    if (!projectId) throw new Error('No project available for land record');

    return this.prisma.landRecord.create({
      data: {
        projectId,
        surveyNumber: data.surveyNumber,
        landAreaAcre: Number(data.landAreaAcre || 1.0),
        ownerName: data.ownerName || 'SPV Entity',
        clearanceStatus: data.clearanceStatus || 'Title Cleared',
      },
    });
  }

  async getReraApprovals(projectId?: string) {
    return this.prisma.reraApproval.findMany({
      where: projectId ? { projectId } : undefined,
    });
  }

  async createReraApproval(data: any) {
    let projectId = data.projectId;
    if (!projectId) {
      const p = await this.prisma.project.findFirst();
      if (p) projectId = p.id;
    }
    if (!projectId) throw new Error('No project available for RERA approval');

    return this.prisma.reraApproval.create({
      data: {
        projectId,
        registrationNo: data.registrationNo,
        validUntil: data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 365 * 86400000 * 2),
        status: data.status || 'approved',
      },
    });
  }

  async getDocuments() {
    return this.prisma.documentVault.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getDrawings() {
    return this.prisma.architecturalDrawing.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createDrawing(data: any) {
    return this.prisma.architecturalDrawing.create({
      data: {
        title: data.title,
        drawingCode: data.drawingCode || `DWG-${Date.now()}`,
        version: data.version || 'v1.0',
        fileUrl: data.fileUrl || '/drawings/structure.dwg',
        approvedBy: data.approvedBy || 'Chief Architect',
      },
    });
  }

  async getOcrLogs() {
    return this.prisma.ocrExtractLog.findMany({ orderBy: { processedAt: 'desc' } });
  }

  async createOcrLog(data: any) {
    return this.prisma.ocrExtractLog.create({
      data: {
        fileName: data.fileName || 'Land_Deed_Scan.pdf',
        extractedText: data.extractedText || 'Extracted Survey #148/A, Non-encumbrance verified.',
      },
    });
  }

  async getDigitalSignatures() {
    return this.prisma.digitalSignatureLog.findMany({ orderBy: { signedAt: 'desc' } });
  }

  async createDigitalSignature(data: any) {
    return this.prisma.digitalSignatureLog.create({
      data: {
        documentTitle: data.documentTitle || 'Customer Agreement - Unit A-101',
        signerName: data.signerName || 'Authorized Signatory',
        certificateHash: data.certificateHash || `SHA256-${Date.now()}`,
      },
    });
  }
}
