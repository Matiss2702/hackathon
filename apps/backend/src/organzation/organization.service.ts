import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { testUser } from 'src/lib/user-checker.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtPayload) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');
    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to view organizations.',
      );
    }

    return this.prisma.organization.findMany({
      where: {
        createdBy: {
          role: {
            not: 'admin',
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    if (!id) throw new NotFoundException('Organization ID not provided');

    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(user: JwtPayload, dto: CreateOrganizationDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    const organization = await this.prisma.organization.create({
      data: {
        ...dto,
        createdBy: {
          connect: { id: user.id },
        },
        updatedBy: {
          connect: { id: user.id },
        },
        users: {
          connect: [{ id: user.id }],
        },
      },
    });

    if (userTest.role !== 'admin') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'organization_admin',
          organization: {
            connect: { id: organization.id },
          },
        },
      });
    }

    return organization;
  }

  async update(user: JwtPayload, id: string, dto: UpdateOrganizationDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    if (!id) throw new NotFoundException('Organization ID not provided');
    const organizationExists = await this.prisma.organization.findUnique({
      where: { id: id },
    });
    if (!organizationExists) {
      throw new NotFoundException('Organization not found');
    }

    const organization = organizationExists;
    const allowedRoles = ['admin', 'organization_admin'];

    if (!allowedRoles.includes(userTest.role)) {
      throw new NotFoundException(
        'You are not authorized to update this organization.',
      );
    }

    if (userTest.role !== 'admin') {
      if (userTest.organization_id !== id) {
        throw new NotFoundException(
          'You are not authorized to update this organization.',
        );
      }

      if (organization.deleted_at) {
        throw new NotFoundException(
          'You cannot update an organization that has been deleted.',
        );
      }
    }

    const { isDeleted, ...rest } = dto;

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: {
        ...rest,
        deleted_at: isDeleted ? new Date() : null,
        updatedBy: {
          connect: { id: user.id },
        },
      },
    });

    return updatedOrganization;
  }

  async delete(user: JwtPayload, id: string) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to delete this organization.',
      );
    }

    await this.prisma.organization.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
