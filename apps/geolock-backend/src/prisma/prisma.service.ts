/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as PostgresClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PostgresClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // À l'initialisation du module, on (re)connecte le PrismaClient
    await this.$connect();
  }

  async onModuleDestroy() {
    // Lors de l'arrêt du module, on ferme la connexion
    await this.$disconnect();
  }
}
