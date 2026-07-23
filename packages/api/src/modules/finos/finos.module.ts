import { Module } from '@nestjs/common';
import { FinosController } from './finos.controller';
import { FinosService } from './finos.service';

@Module({
  controllers: [FinosController],
  providers: [FinosService],
  exports: [FinosService],
})
export class FinosModule {}
