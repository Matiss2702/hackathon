import { NestFactory } from '@nestjs/core';
import { json, raw } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // 1) Désactivation du parser interne
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
  });

  // 2) Validation/transformation avant tout
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3) Parser JSON pour toutes les autres routes
  app.use(json());

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Server listening on http://localhost:${port}`);
}

void bootstrap();
