import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthGuardMiddleware } from 'src/auth-guard/auth-guard.middleware';
import { EmailService } from '../email.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthGuardMiddleware)
      .exclude(
        { path: '/users', method: RequestMethod.POST },
        { path: '/users/recovery', method: RequestMethod.POST },
      )
      .forRoutes(UsersController);
  }
}
