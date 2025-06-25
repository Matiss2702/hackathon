import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentiaDto } from './dto/create-agentia.dto';
import { UpdateAgentiaDto } from './dto/update-agentia.dto';

@Injectable()
export class AgentiaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAgentiaDto) {
    return this.prisma.agentIA.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(includeUser = false) {
    return this.prisma.agentIA.findMany({
      include: includeUser ? { user: true } : undefined,
    });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agentIA.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException('AgentIA not found');
    return agent;
  }

  async update(id: string, dto: UpdateAgentiaDto) {
    return this.prisma.agentIA.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.agentIA.delete({ where: { id } });
  }
} 