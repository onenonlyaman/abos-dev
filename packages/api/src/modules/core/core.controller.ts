import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CoreService } from './core.service';
import { CreateSpvDto } from './dto/create-spv.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Controller('spvs')
export class SpvController {
  constructor(private readonly core: CoreService) {}

  @Post()
  create(@Body() dto: CreateSpvDto) {
    return this.core.createSpv(dto);
  }

  @Get()
  list() {
    return this.core.listSpvs();
  }
}

@Controller('projects')
export class ProjectController {
  constructor(private readonly core: CoreService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.core.createProject(dto);
  }

  @Get()
  list() {
    return this.core.listProjects();
  }
}

@Controller('units')
export class UnitController {
  constructor(private readonly core: CoreService) {}

  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.core.createUnit(dto);
  }

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.core.listUnits(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.core.getUnit(id);
  }
}
