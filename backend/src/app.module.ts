import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { CookieGuard } from './modules/auth/guard/cookie.guard';
import { FileModule } from './modules/file/file.module';
import { RedisModule } from './modules/redis/redis.module';
import { ShopModule } from './modules/shop/shop.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TaskModule } from './task/task.module';
import { ProductModule } from './modules/product/product.module';
import { EventbusModule } from './modules/eventbus/eventbus.module';
import { ElasticsearchModule } from './modules/elasticsearch/elasticsearch.module';
import { CartModule } from './modules/cart/cart.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { GenemiChatbotModule } from './modules/genemi-chatbot/genemi-chatbot.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10
        }
      ]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: process.env.NODE_ENV !== 'production',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      installSubscriptionHandlers: true,// ho tro realtime socket
      context: ({ req }) => ({ req })
    }),
    ScheduleModule.forRoot(),
    EmailModule, AuthModule, ShopModule, UserModule, FileModule, TaskModule, RedisModule, ProductModule, EventbusModule, ElasticsearchModule, CartModule,
    StripeModule, GenemiChatbotModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      inject: [Reflector],
      useFactory: (reflector: Reflector) => new CookieGuard(reflector)
    }
  ],
})
export class AppModule { }
