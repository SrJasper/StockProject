import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { genSalt, hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from 'src/interfaces/IUser';
import { EmailService } from 'src/email.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mail: EmailService,
  ) {}

  async userInfo(user: IUser) {
    try {
      const findUser = await this.databaseService.user.findUnique({
        where: { id: user.id },
      });
      return findUser;
    } catch (error) {
      throw new BadRequestException('Usuário não encontrado');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { confirmPassword, ...userData } = createUserDto;
    const salt = await genSalt(10);
    const passHash = await hash(createUserDto.password, salt);

    const newUser = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (newUser) {
      throw new BadRequestException('O e-mail colocado já está cadastrado');
    } else {
      if (createUserDto.password !== confirmPassword) {
        throw new BadRequestException(
          'A senha e a confirmação de senha não coincidem.',
        );
      }
    }

    try {
      const newUser = await this.databaseService.user.create({
        data: {
          ...userData,
          password: passHash,
        },
      });
      return 'O usuário de ' + newUser.name + ' foi criado!';
    } catch {
      throw new BadRequestException('Houve um erro ao criar o usuário');
    }
  }

  async recovery(updateUserDto: UpdateUserDto) {
    const userDB = await this.databaseService.user.findUnique({
      where: { email: updateUserDto.email },
    });
    if (userDB && userDB.id !== 29) {
      const newPassword = Math.random().toString(36).slice(-8);
      const salt = await genSalt(10);
      const passHash = await hash(newPassword, salt);
      await this.databaseService.user.update({
        where: { email: updateUserDto.email },
        data: {
          password: passHash,
        },
      });

      await this.mail.sendEmail(
        updateUserDto.email,
        'Recuperação de senha',
        'Sua nova senha é: ' + newPassword,
      );
      return 'A senha do usuário ' + updateUserDto.email + ' foi alterada';
    } else {
      throw new BadRequestException('O usuário não foi encontrado');
    }
  }

  /*
  @Body
  name?: string
  password?: string
  role?: string
  admin?: boolean
  */
  async update(updateUserDto: UpdateUserDto, user: IUser) {
    if (!user) {
      throw new BadRequestException('Você não está logado');
    }

    let guestModifies = 0;

    let userName: string;
    if (updateUserDto.name) {
      userName = updateUserDto.name;
      guestModifies++;
    } else {
      userName = user.name;
    }

    let language: string;
    if (updateUserDto.language) {
      language = updateUserDto.language;
    } else {
      language = user.language;
    }
    
    const userDB = await this.databaseService.user.findUnique({
      where: { id: user.id },
    });    
    
    let passHash: string;
    if(updateUserDto.password){
      const salt = await genSalt(10);
      passHash = await hash(updateUserDto.password, salt);
      guestModifies++;
    } else { 
      passHash = userDB.password;
    }

    if(userDB.id === 29 && guestModifies > 0){
      throw new BadRequestException('You can only change this account language');
    }

    if (userDB) {
      await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          name: userName,
          language: language,
          password: passHash,
        },
      });
      return 'O seu usuário foi alterado\n' + userName;
    } else {
      throw new BadRequestException('O usuário não foi encontrado');
    }
  }

  async remove(id: number) {
    const userDb = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (userDb && userDb.id !== 29) {
      await this.databaseService.user.delete({ where: { id } });
      return 'usuário deletado';
    } else {
      throw new BadRequestException(
        'Não foi possível deletar o usuário'
      );
    }
  }

  
}
