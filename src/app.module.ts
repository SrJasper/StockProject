import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AuthGuardMiddleware } from './auth-guard/auth-guard.middleware';

@Module({
  imports: [StocksModule, UsersModule, DatabaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    consumer.apply(AuthGuardMiddleware).forRoutes("/stocks")

  }
}
