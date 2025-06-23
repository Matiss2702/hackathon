// src/main.ts
import { NestFactory } from '@nestjs/core';
import { json, raw } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // 1) Désactivation du body-parser par défaut de Nest
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
  });

  // 2) Monte notre propre raw() pour Stripe, AVANT tout parser JSON
  //    et on stocke le Buffer dans req.rawBody
  app.use(
    '/billing/webhook',
    raw({
      type: 'application/json',
      verify: (req, _res, buf) => {
        // @ts-ignore
        req.rawBody = buf;
      },
    }),
  );

  // 3) Validation globale pour toutes tes autres routes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4) Ensuite, le parser JSON standard pour le reste
  app.use(json());

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Server listening on http://localhost:${port}`);
}

void bootstrap();
