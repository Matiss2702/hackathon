import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentiaDto } from './dto/create-agentia.dto';
import { UpdateAgentiaDto } from './dto/update-agentia.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AgentIA } from '@prisma/client';

@Injectable()
export class AgentiaService {
  constructor(private readonly prisma: PrismaService) {}

  async testUser(user: JwtPayload) {
    if (!user.id) {
      throw new NotFoundException('Test User : User ID not found in token');
    }

    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!found) {
      throw new NotFoundException('Test User : User not found');
    }

    return found;
  }

  async create(user: JwtPayload, dto: CreateAgentiaDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await this.testUser(user);
    if (!userTest) throw new NotFoundException('User not found');

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to create this agent.',
      );
    }

    const { ...safeDto } = dto;

    return this.prisma.agentIA.create({
      data: {
        ...safeDto,
        user: { connect: { id: userTest.id } },
        createdBy: { connect: { id: userTest.id } },
      },
    });
  }

  async findAllPublic() {
    let agents = [] as AgentIA[];

    agents = await this.prisma.agentIA.findMany({
      where: { isVisible: true },
      orderBy: {
        name: 'asc',
      },
    });

    return agents;
  }

  async findAll(user: JwtPayload) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await this.testUser(user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    let agents = [] as AgentIA[];

    if (userTest.role === 'admin') {
      agents = await this.prisma.agentIA.findMany({
        orderBy: {
          updated_at: 'desc',
        },
      });
    } else {
      agents = await this.prisma.agentIA.findMany({
        where: { userId: userTest.id },
        orderBy: {
          updated_at: 'desc',
        },
      });
    }

    return agents;
  }

  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Agent ID not found');
    }
    const agent = await this.prisma.agentIA.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return agent;
  }

  async update(user: JwtPayload, dto: UpdateAgentiaDto) {
    const userTest = await this.testUser(user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to update this agent.',
      );
    }

    const { ...safeDto } = dto;

    return this.prisma.agentIA.update({
      where: { id: dto.id },
      data: {
        ...safeDto,
        updatedBy: { connect: { id: userTest.id } },
      },
    });
  }

  async remove(user: JwtPayload, id: string) {
    if (!user || !id) {
      throw new NotFoundException();
    }

    const userTest = await this.testUser(user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to delete this agent.',
      );
    }

    return this.prisma.agentIA.delete({ where: { id } });
  }
}
