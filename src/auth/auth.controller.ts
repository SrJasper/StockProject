import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
  @Body
  email
  password
  */
  @Post('login')
  async login(@Body() loginCredentials: LoginCredentialsDto) {
    try {
      const token = await this.authService.login(loginCredentials);
      return token;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/guest')
  removeGuest() {
    return this.authService.clearGuestsStocks();
  }
}
