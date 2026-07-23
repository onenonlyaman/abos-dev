import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReassignTaskDto } from './dto/reassign-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Get()
  list(@Query('status') status?: TaskStatus) {
    return this.tasks.list(status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tasks.get(id);
  }

  @Post(':id/reassign')
  reassign(@Param('id') id: string, @Body() dto: ReassignTaskDto) {
    return this.tasks.reassign(id, dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.tasks.close(id);
  }
}
