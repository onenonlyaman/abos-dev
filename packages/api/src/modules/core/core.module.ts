import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { SpvController, ProjectController, UnitController } from './core.controller';

@Module({
  controllers: [SpvController, ProjectController, UnitController],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
