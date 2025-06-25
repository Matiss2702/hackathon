import { Module } from '@nestjs/common';
import { AgentiaService } from './agentia.service';
import { AgentiaController } from './agentia.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgentiaController],
  providers: [AgentiaService],
})
export class AgentiaModule {} 