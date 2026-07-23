import { Module } from '@nestjs/common';
import { HrService } from './hr.service';
import { HrController, EmployeeSessionController } from './hr.controller';

@Module({
  controllers: [HrController, EmployeeSessionController],
  providers: [HrService],
})
export class HrModule {}
