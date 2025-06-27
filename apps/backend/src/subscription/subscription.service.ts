import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Subscription } from '@prisma/client';
import { testUser } from 'src/lib/user-checker.service';

type Tarification = {
  id: string;
  name: string;
  price: number;
  token: number;
  description: string[];
  planType: 'monthly' | 'annually' | 'free';
};

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtPayload) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    let subscriptions = [] as Subscription[];

    subscriptions = await this.prisma.subscription.findMany({
      where: {
        user: { id: userTest.id },
      },
      orderBy: {
        end_at: 'desc',
      },
    });

    return subscriptions;
  }

  async findOne(user: JwtPayload, id: string) {
    if (!user) {
      throw new NotFoundException('User ID not found');
    }

    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (!id) {
      throw new NotFoundException('Subscription ID not found');
    }
    const subscriptionExists = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscriptionExists) {
      throw new NotFoundException('Subscription not found');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    return subscription;
  }

  async create(user: JwtPayload, dto: CreateSubscriptionDto) {
    if (!user) throw new NotFoundException('User not found');

    const userTest = await testUser(this.prisma, user);
    if (!userTest) throw new NotFoundException('User not found');

    if (dto.tarification && !(dto.tarification as Tarification).id) {
      throw new NotFoundException('Tarification ID not provided');
    }

    const tarificationExists = await this.prisma.tarification.findUnique({
      where: { id: (dto.tarification as Tarification).id },
    });

    if (!tarificationExists) {
      throw new NotFoundException('Tarification not found');
    }

    const allowedPlans = ['monthly', 'annually', 'free'];

    if (!allowedPlans.includes((dto.tarification as Tarification).planType)) {
      throw new NotFoundException('Invalid plan type');
    }

    let end_at: Date;
    if ((dto.tarification as Tarification).planType === 'annually') {
      end_at = new Date();
      end_at.setFullYear(end_at.getFullYear() + 1);
    } else {
      end_at = new Date();
      end_at.setMonth(end_at.getMonth() + 1);
    }

    return this.prisma.subscription.create({
      data: {
        ...dto,
        user: { connect: { id: userTest.id } },
        createdBy: { connect: { id: userTest.id } },
        updatedBy: { connect: { id: userTest.id } },
        end_at,
      },
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateSubscriptionDto) {
    const userTest = await testUser(this.prisma, user);
    if (!userTest) {
      throw new NotFoundException('User not found');
    }

    if (userTest.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to update this subscription.',
      );
    }

    if (!id) {
      throw new NotFoundException('Subscription ID not provided');
    }

    const subscriptionExists = await this.prisma.subscription.findUnique({
      where: { id: id },
    });

    if (!subscriptionExists) {
      throw new NotFoundException('Subscription not found');
    }

    const sub = subscriptionExists;

    return this.prisma.subscription.update({
      where: { id: sub.id },
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
        'You are not authorized to delete this subscription.',
      );
    }

    return this.prisma.subscription.delete({ where: { id } });
  }
}
