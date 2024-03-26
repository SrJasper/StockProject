import { IsOptional, IsString, IsStrongPassword, Length } from "class-validator"

export class UpdateUserDto{
  @IsOptional()
  @IsString({message: "O nome é obrigatorio!"})
  @Length(3, 55, {message: "Nome deve conter de 3 a 55 caracteres!"})
  name: string

  @IsOptional()
  @IsStrongPassword({minLength:8, minLowercase: 1, minNumbers: 1, minUppercase: 1}, {message: "Senha deve ser forte!"})
  password: string

  @IsOptional()
  @IsString({message: "Cargo deve ser informado!"})
  @Length(3, 55, {message: "Cargo deve ter de 3 a 55 caracteres!"})
  role: string

  @IsOptional()
  confirmPassword: string

  @IsOptional()
  admin: boolean
}
