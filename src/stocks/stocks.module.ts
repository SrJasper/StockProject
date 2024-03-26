import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthGuardMiddleware } from 'src/auth-guard/auth-guard.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthGuardMiddleware).forRoutes(StocksController);
  }
}
