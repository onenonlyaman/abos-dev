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
import { ConstructionModule } from './modules/construction/construction.module';
import { BoqModule } from './modules/boq/boq.module';
import { QualityModule } from './modules/quality/quality.module';
import { FinosModule } from './modules/finos/finos.module';
import { LegalModule } from './modules/legal/legal.module';
import { AiModule } from './modules/ai/ai.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { PortalsModule } from './modules/portals/portals.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';

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
    ConstructionModule,
    BoqModule,
    QualityModule,
    FinosModule,
    LegalModule,
    AiModule,
    WorkflowsModule,
    AccountingModule,
    PayrollModule,
    CommunicationModule,
    PortalsModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
