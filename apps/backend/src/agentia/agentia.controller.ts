import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { AgentiaService } from './agentia.service';
import { CreateAgentiaDto } from './dto/create-agentia.dto';
import { UpdateAgentiaDto } from './dto/update-agentia.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('agentia')
export class AgentiaController {
  constructor(private readonly agentiaService: AgentiaService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req, @Body() dto: CreateAgentiaDto) {
    return this.agentiaService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query('includeUser') includeUser?: string) {
    return this.agentiaService.findAll(includeUser === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentiaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAgentiaDto) {
    return this.agentiaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.agentiaService.remove(id);
  }
} 