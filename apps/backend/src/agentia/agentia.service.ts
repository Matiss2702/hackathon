import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentiaDto } from './dto/create-agentia.dto';
import { UpdateAgentiaDto } from './dto/update-agentia.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AgentIA } from '@prisma/client';
import { testUser } from 'src/lib/user-checker.service';

@Injectable()
export class AgentiaService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(user: JwtPayload, from?: string) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    let agents = [] as AgentIA[];

    if (userTest.role === 'admin') {
      if (from && from === 'admin') {
        agents = await this.prisma.agentIA.findMany({
          orderBy: {
            updated_at: 'desc',
          },
        });
      }

      if (from && from === 'organization') {
        agents = await this.prisma.agentIA.findMany({
          where: { organization_id: userTest.organization_id },
          orderBy: {
            updated_at: 'desc',
          },
        });
      }
    } else {
      agents = await this.prisma.agentIA.findMany({
        where: { organization_id: userTest.organization_id },
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

  async create(user: JwtPayload, dto: CreateAgentiaDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    const allowedRoles = ['admin', 'organization_admin'];

    if (!allowedRoles.includes(userTest.role)) {
      throw new NotFoundException(
        'You are not authorized to create this agent.',
      );
    }

    if (!userTest.organization_id) {
      throw new NotFoundException('User organization not found');
    }

    const { ...safeDto } = dto;

    return this.prisma.agentIA.create({
      data: {
        ...safeDto,
        organization: { connect: { id: userTest.organization_id } },
        createdBy: { connect: { id: userTest.id } },
        updatedBy: { connect: { id: userTest.id } },
      },
    });
  }

  async update(user: JwtPayload, dto: UpdateAgentiaDto) {
    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = ['admin', 'organization_admin'];
    if (!allowedRoles.includes(userTest.role)) {
      throw new NotFoundException(
        'You are not authorized to update this organization.',
      );
    }

    if (!dto.id) {
      throw new NotFoundException('Agent ID not provided');
    }

    const agentExists = await this.prisma.agentIA.findUnique({
      where: { id: dto.id },
    });

    if (!agentExists) {
      throw new NotFoundException('Agent not found');
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

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = ['admin', 'organization_admin'];
    if (!allowedRoles.includes(userTest.role)) {
      throw new NotFoundException(
        'You are not authorized to delete this organization.',
      );
    }

    return this.prisma.agentIA.delete({ where: { id } });
  }
}
