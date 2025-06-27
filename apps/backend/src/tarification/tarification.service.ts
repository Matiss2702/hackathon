import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTarificationDto } from './dto/create-tarification.dto';
import { UpdateTarificationDto } from './dto/update-tarification.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Tarification } from '@prisma/client';
import { testUser } from 'src/lib/user-checker.service';

@Injectable()
export class TarificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    let tarifications = [] as Tarification[];

    tarifications = await this.prisma.tarification.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return tarifications;
  }

  async findAll(user: JwtPayload) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to view this tarificationia.',
      );
    }

    let tarifications = [] as Tarification[];

    tarifications = await this.prisma.tarification.findMany({});

    return tarifications;
  }

  async findOne(user: JwtPayload, id: string, from?: string) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (from && from !== 'front') {
      if (userTest.role !== 'admin') {
        throw new NotFoundException(
          'You are not authorized to view this tarificationia.',
        );
      }
    }

    if (!id) {
      throw new NotFoundException('Tarification ID not found');
    }
    const tarificationExists = await this.prisma.tarification.findUnique({
      where: { id },
    });

    if (!tarificationExists) {
      throw new NotFoundException('Tarification not found');
    }

    const tarification = await this.prisma.tarification.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return tarification;
  }

  async create(user: JwtPayload, dto: CreateTarificationDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to create this tarification.',
      );
    }

    return this.prisma.tarification.create({
      data: {
        ...dto,
        createdBy: { connect: { id: userTest.id } },
        updatedBy: { connect: { id: userTest.id } },
      },
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateTarificationDto) {
    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to update this tarification.',
      );
    }

    if (!id) {
      throw new NotFoundException('Tarification ID not provided');
    }

    const tarificationExists = await this.prisma.tarification.findUnique({
      where: { id: id },
    });

    if (!tarificationExists) {
      throw new NotFoundException('Tarification not found');
    }

    const tarif = tarificationExists;

    return this.prisma.tarification.update({
      where: { id: tarif.id },
      data: {
        ...dto,
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

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to delete this tarification.',
      );
    }

    return this.prisma.tarification.delete({ where: { id } });
  }
}
