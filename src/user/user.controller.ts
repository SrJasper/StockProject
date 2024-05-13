import { Controller, Post,  Body,  Patch,  Param,  Delete, Req, Get, BadRequestException} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info/:user')
  async userInfo(@Param('user') user:string){
    try {
      console.log('Entrou certo');
      const listaOne = await this.usersService.userInfo(user);
      return listaOne;
    } catch (error) {
      throw new BadRequestException('Deu erro');
    }    
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto, @Req() req: Request
  ) {    
    return this.usersService.update(+id, updateUserDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

