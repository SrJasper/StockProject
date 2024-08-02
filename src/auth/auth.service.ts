import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { DatabaseService } from 'src/database/database.service';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly databaseService: DatabaseService,
  ) {}

  async login(loginCredentialsDto: LoginCredentialsDto) {
    const user = await this.db.user.findUnique({
      where: { email: loginCredentialsDto.email },
    });
    console.log(user);
    if (!user) {
      throw new BadRequestException('E-mail não encontrado!');
    }
    const verifiedUser = await compare(
      loginCredentialsDto.password,
      user.password,
    );
    if (!verifiedUser) {
      throw new BadRequestException('Senha incorreta!');
    }
    const token = sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: '10d',
    });
    return token;
  }

  async clearGuestsStocks() {
    await this.databaseService.stock.deleteMany({  where: { ownerId: 29 }  });
    const token = await this.login({ email: 'g@g.com', password: '123' });
    return token;
  }
}
