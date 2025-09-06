import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import express from 'express'
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable cookie parser middleware
  app.use(cookieParser());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'email_queue',
      queueOptions: {
        durable: false,
      },
    }
  })
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('E-commerce platform API documentation')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use('/upload', express.static(join(__dirname, '..', 'upload')))

  app.getHttpAdapter().getInstance().set('trust proxy', 1)
  await app.startAllMicroservices()
  await app.listen(4000);
}
bootstrap();
