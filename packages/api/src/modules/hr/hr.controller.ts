import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LoginSessionDto } from './dto/login-session.dto';

@Controller('employees')
export class HrController {
  constructor(private readonly hr: HrService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.hr.createEmployee(dto);
  }

  @Get()
  list() {
    return this.hr.listEmployees();
  }

  @Post(':id/sessions')
  login(@Param('id') id: string, @Body() dto: LoginSessionDto) {
    return this.hr.login(id, dto);
  }

  @Get(':id/sessions')
  sessions(@Param('id') id: string) {
    return this.hr.listSessions(id);
  }
}

@Controller('employee-sessions')
export class EmployeeSessionController {
  constructor(private readonly hr: HrService) {}

  @Post(':id/logout')
  logout(@Param('id') id: string) {
    return this.hr.logout(id);
  }

  @Get()
  list(@Query('employeeId') employeeId?: string) {
    return this.hr.listSessions(employeeId);
  }
}
