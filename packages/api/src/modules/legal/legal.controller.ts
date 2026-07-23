import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('contracts')
  getContracts(@Query('projectId') projectId?: string) {
    return this.legalService.getContracts(projectId);
  }

  @Get('land-records')
  getLandRecords(@Query('projectId') projectId?: string) {
    return this.legalService.getLandRecords(projectId);
  }

  @Post('land-records')
  createLandRecord(@Body() body: any) {
    return this.legalService.createLandRecord(body);
  }

  @Get('rera')
  getReraApprovals(@Query('projectId') projectId?: string) {
    return this.legalService.getReraApprovals(projectId);
  }

  @Post('rera')
  createReraApproval(@Body() body: any) {
    return this.legalService.createReraApproval(body);
  }

  @Get('documents')
  getDocuments() {
    return this.legalService.getDocuments();
  }

  @Get('drawings')
  getDrawings() {
    return this.legalService.getDrawings();
  }

  @Post('drawings')
  createDrawing(@Body() body: any) {
    return this.legalService.createDrawing(body);
  }

  @Get('ocr-logs')
  getOcrLogs() {
    return this.legalService.getOcrLogs();
  }

  @Post('ocr-logs')
  createOcrLog(@Body() body: any) {
    return this.legalService.createOcrLog(body);
  }

  @Get('digital-signatures')
  getDigitalSignatures() {
    return this.legalService.getDigitalSignatures();
  }

  @Post('digital-signatures')
  createDigitalSignature(@Body() body: any) {
    return this.legalService.createDigitalSignature(body);
  }
}
