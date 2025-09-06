import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EmailModule } from './email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CookieGuard } from './modules/auth/guard/cookie.guard';
import { ShopModule } from './modules/shop/shop.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { MulterModule } from '@nestjs/platform-express';
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
    EmailModule, AuthModule, ShopModule, UserModule, FileModule
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
