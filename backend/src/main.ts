import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import express from 'express'
import { join } from 'path';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'
import csurf from 'csurf'
import { MyLogger } from './modules/logger/logger.service';
// Global BigInt serializer to handle BigInt values in JSON responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useLogger(new MyLogger())
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
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Cart', 'Cart management endpoints')
    .addTag('Product', 'Product management endpoints')
    .addTag('Shop', 'Shop management endpoints')
    .addTag('User', 'User management endpoints')
    .addTag('Comment', 'Comment management endpoints')
    .addTag('Chat', 'Chat endpoints')
    .addTag('File', 'File upload endpoints')
    .addTag('Stripe', 'Payment endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.use(helmet());
  app.use('/upload', express.static(join(__dirname, '..', 'upload')))
  app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }))
  app.getHttpAdapter().getInstance().set('trust proxy', 1)
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices()
  await app.listen(4000);
}
bootstrap();
