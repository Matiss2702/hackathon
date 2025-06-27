import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './email.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AgentiaModule } from './agentia/agentia.module';
import { OrganizationModule } from './organzation/organization.module';
import { OrganizationService } from './organzation/organization.service';
import { TarificationModule } from './tarification/tarification.module';
import { TarificationService } from './tarification/tarification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AgentiaModule,
    OrganizationModule,
    TarificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    UserService,
    OrganizationService,
    TarificationService,
  ],
})
export class AppModule {}
