import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { CoreModule } from './modules/core/core.module';
import { BookingModule } from './modules/booking/booking.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FinanceModule } from './modules/finance/finance.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { HrModule } from './modules/hr/hr.module';
import { FleetModule } from './modules/fleet/fleet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      },
    }),
    PrismaModule,
    CoreModule,
    BookingModule,
    LeadsModule,
    ProcurementModule,
    InventoryModule,
    FinanceModule,
    TasksModule,
    HrModule,
    FleetModule,
  ],
})
export class AppModule {}
