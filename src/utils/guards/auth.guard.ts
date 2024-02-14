import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())

    if (isPublic) {
      return isPublic;
    }

    const req: Request = context.switchToHttp().getRequest();

    try {

      const access_token = req.headers.authorization.split(" ").at(1);
      const isValidToken = this.jwt.verify(access_token);

      req['user'] = isValidToken;

      if (isValidToken) {
        return true;
      }
    } catch (error) {

      if (error instanceof TypeError) {
        throw new HttpException("Token is not provided.", HttpStatus.FORBIDDEN)
      }

      if (error instanceof TokenExpiredError) {
        throw new HttpException(error.message.toUpperCase(), HttpStatus.FORBIDDEN)
      }
    }

    return false;
  }
}
