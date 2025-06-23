// src/auth/auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

declare module 'express' {
  interface Request {
    user: JwtPayload;
  }
}

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  /**
   * On reprend la signature générique de NestAuthGuard,
   * et on ajoute un paramètre _status qu'on n'utilise pas.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest<TUser extends JwtPayload = JwtPayload>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }

    const req = context.switchToHttp().getRequest<Request>();
    req.user = user;
    return user;
  }
}
