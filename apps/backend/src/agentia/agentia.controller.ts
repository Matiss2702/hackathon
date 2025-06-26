import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AgentiaService } from './agentia.service';
import { CreateAgentiaDto } from './dto/create-agentia.dto';
import { UpdateAgentiaDto } from './dto/update-agentia.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('agentia')
export class AgentiaController {
  constructor(private readonly agentiaService: AgentiaService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAgentiaDto) {
    return this.agentiaService.create(user, dto);
  }

  @Get('/public')
  findAllPublic() {
    return this.agentiaService.findAllPublic();
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.agentiaService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentiaService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAgentiaDto) {
    return this.agentiaService.update(user, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.agentiaService.remove(user, id);
  }
}
