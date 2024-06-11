import { IsEmail, IsString, IsStrongPassword, Length } from "class-validator"

export class CreateUserDto {
  @IsString({message: 'O nome é obrigatorio!'})
  @Length(3, 55, {message: 'Nome deve conter de 3 a 55 caracteres!'})
  name: string

  @IsString({message: 'Um idioma deve ser informado!'})
  language: string

  @IsString({message: 'E-mail deve ser informado!'})
  @IsStrongPassword({minLength:8, minLowercase: 1, minNumbers: 1, minUppercase: 1}, {message: "Senha deve ser forte!"})
  @IsEmail({}, {message: 'O e-mail não é válido'})
  email: string

  @IsString({message: 'Deve ser informada uma senha!'})
  password: string

  confirmPassword: string
}