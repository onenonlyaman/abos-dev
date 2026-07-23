import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendance() {
    return this.prisma.attendanceRecord.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }

  async createAttendance(data: any) {
    let employeeId = data.employeeId;
    if (!employeeId) {
      const emp = await this.prisma.employee.findFirst();
      if (emp) employeeId = emp.id;
    }
    if (!employeeId) throw new Error('No employee found for attendance');

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        checkIn: data.checkIn ? new Date(data.checkIn) : new Date(),
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        status: data.status || 'present',
      },
    });
  }

  async getLeaves() {
    return this.prisma.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async createLeave(data: any) {
    let employeeId = data.employeeId;
    if (!employeeId) {
      const emp = await this.prisma.employee.findFirst();
      if (emp) employeeId = emp.id;
    }
    if (!employeeId) throw new Error('No employee found for leave request');

    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType: data.leaveType || 'casual',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 86400000),
        reason: data.reason || 'Personal leave',
      },
    });
  }

  async getPayrollDisbursals() {
    return this.prisma.payrollDisbursal.findMany({
      include: { employee: true },
      orderBy: { disbursedAt: 'desc' },
    });
  }

  async createPayrollDisbursal(data: any) {
    let employeeId = data.employeeId;
    if (!employeeId) {
      const emp = await this.prisma.employee.findFirst();
      if (emp) employeeId = emp.id;
    }
    if (!employeeId) throw new Error('No employee found for payroll disbursal');

    const basicSalary = Number(data.basicSalary || 50000);
    const allowances = Number(data.allowances || 15000);
    const tds = (basicSalary + allowances) * 0.1; // 10% TDS deduction
    const pf = basicSalary * 0.12; // 12% PF deduction
    const totalDeductions = tds + pf;
    const netPayable = basicSalary + allowances - totalDeductions;

    return this.prisma.payrollDisbursal.create({
      data: {
        employeeId,
        monthYear: data.monthYear || '2026-07',
        basicSalary,
        allowances,
        deductions: totalDeductions,
        netPayable,
      },
    });
  }

  async getJobPostings() {
    return this.prisma.jobPosting.findMany({ orderBy: { postedAt: 'desc' } });
  }

  async createJobPosting(data: any) {
    return this.prisma.jobPosting.create({
      data: {
        title: data.title,
        department: data.department || 'Engineering',
        location: data.location || 'Mumbai HQ',
        status: 'open',
      },
    });
  }

  async getPerformanceReviews() {
    return this.prisma.performanceReview.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPerformanceReview(data: any) {
    return this.prisma.performanceReview.create({
      data: {
        employeeName: data.employeeName,
        reviewPeriod: data.reviewPeriod || 'Q2 2026',
        ratingScore: Number(data.ratingScore || 4.5),
        feedback: data.feedback || 'Exceeds expectation in project delivery.',
      },
    });
  }
}
