// src/auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // 1) Récupère la liste des rôles autorisés sur ce handler
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      ctx.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      // pas de restriction → laisse passer
      return true;
    }

    // 2) Récupère l'utilisateur (injeté par AuthGuard)
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Accès refusé (pas de rôle défini)');
    }

    // 3) Compare rôles
    const userRoleNames = user.roles.map((r: any) => r.name);
    const hasMatching = requiredRoles.some(r => userRoleNames.includes(r));
    if (!hasMatching) {
      throw new ForbiddenException(
        `Accès réservé aux rôles : ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
