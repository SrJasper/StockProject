import { PartialType } from "@nestjs/mapped-types"
import { IsOptional, IsString, IsStrongPassword, Length } from "class-validator"
import { CreateUserDto } from "./create-user.dto"

export class UpdateUserDto extends PartialType(CreateUserDto){
  @IsOptional()
  @IsString({message: "O nome deve ser uma string!"})
  @Length(3, 55, {message: "Nome deve conter de 3 a 55 caracteres!"})
  name: string

  @IsOptional()
  language: string

  @IsOptional()
  @IsStrongPassword({minLength:8, minLowercase: 1, minNumbers: 1, minUppercase: 1}, {message: "Senha deve ser forte!"})
  password: string
}
