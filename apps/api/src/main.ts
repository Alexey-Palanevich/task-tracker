import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnv } from './env';

async function bootstrap() {
  const env = getEnv();
  const app = await NestFactory.create(AppModule);

  if (env.CORS_ORIGIN) {
    app.enableCors({
      origin: env.CORS_ORIGIN.split(',').map((v) => v.trim()),
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  await app.listen(env.PORT);
}

bootstrap();

