/* eslint-disable @typescript-eslint/no-namespace */
import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { IUser } from 'src/interfaces/IUser';


declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

@Injectable()
export class AuthGuardMiddleware implements NestMiddleware {
  
  constructor(private readonly db: DatabaseService){}
  
  async use(req: Request, res: Response, next: NextFunction) {

    const headerToken = req.headers['authorization']

    if(!headerToken) throw new BadRequestException('Nenhum token informado!')

    const token = headerToken.split(' ')[1]

    verify(token, process.env.SECRET, async (err, decodedToken: {userId: number}) => {
      if(err){
        throw new BadRequestException('Token não é valido! Refaça a autenticação para continuar!')
      }

      const {id, name, language, email, password} = await this.db.user.findUnique({where: {id: decodedToken.userId}})

      req.user = {id, name, language, email, password}
      next();
    })
  }
}
