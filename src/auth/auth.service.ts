import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { DatabaseService } from 'src/database/database.service';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {

  constructor(private readonly db: DatabaseService) {}

  async login(loginCredentialsDto:LoginCredentialsDto) {    
    const user = await this.db.user.findUnique({where: {email: loginCredentialsDto.email}})
    if(!user){
      throw new BadRequestException('Nenhum usuário encontrado com esse e-mail!')
    }
    const verifiedUser = await compare(loginCredentialsDto.password, user.password)
    if(!verifiedUser){
      throw new BadRequestException('Credenciais invalidas!')
    } 
    const token = sign({userId: user.id}, process.env.SECRET, {expiresIn: '10d'})
    return token
  }
}
