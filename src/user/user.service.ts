import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { genSalt, hash } from 'bcryptjs'
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from 'src/interfaces/IUser';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async userInfo (user: IUser){
    try {
      const findUser = await this.databaseService.user.findUnique({ where: {id: user.id}} );
      return findUser;
    } catch (error) {
      throw new BadRequestException('Usuário não encontrado');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { confirmPassword, ...userData } = createUserDto;
    const salt = await genSalt(10);
    const passHash = await hash(createUserDto.password, salt);

    const newUser = await this.databaseService.user.findUnique({ where: {email: createUserDto.email}} );
    if(newUser){
      throw new BadRequestException('O e-mail colocado já está cadastrado');
    } else{
      if (createUserDto.password !== confirmPassword) {
        throw new BadRequestException('A senha e a confirmação de senha não coincidem.');
      }      
    }

    try{
      const newUser = await this.databaseService.user.create({
        data: {
          ...userData,
          password: passHash,
        },
      });
      return 'O usuário de ' + newUser.name + ' foi criado!';
    } catch{ 
      throw new BadRequestException('Houve um erro ao criar o usuário');
    }    
  }


  /*
  @Body
  name?: string
  password?: string
  role?: string
  admin?: boolean
  */
  async update(id: number, updateUserDto: UpdateUserDto, user: IUser) {
    console.log('user: ' + user.name);
    if(updateUserDto.password){
      if(updateUserDto.password !== updateUserDto.confirmPassword){
        throw new BadRequestException('As senhas devem ser iguais para alterá-las');
      }
    }
    const userDB = await this.databaseService.user.findUnique({ where: {id}} );
    if(userDB){
      await this.databaseService.user.update({ 
        where: {id},
        data:{
          ...updateUserDto,
        },
      });
      return 'O seu usuário foi alterado, ' + updateUserDto.name;
    } else {
      throw new BadRequestException('O usuário não foi encontrado');
    }
  }

  async remove(id: number) {
    const userDb = await this.databaseService.user.findUnique({ where: {id}} );

    if(userDb){
      await this.databaseService.user.delete({ where: {id}} );
      return 'usuário deletado';
    } else {
      throw new BadRequestException('Nenhum usuário cadastrado com o id: ' + id);
    }
  }
}
