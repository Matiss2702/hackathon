import { Module } from '@nestjs/common';
import { TarificationService } from './tarification.service';
import { TarificationController } from './tarification.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TarificationController],
  providers: [TarificationService],
})
export class TarificationModule {}
