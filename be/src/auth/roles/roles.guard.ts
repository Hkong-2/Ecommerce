import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Phương thức chặn Request và phân quyền dựa vào Metadata '@Roles' đã được cài đặt lên controller method.
   * @param context Context chứa thông tin về execution
   * @returns boolean - Cho phép hay cấm qua
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Lấy Roles ở function method
      context.getClass(), // Lấy Roles ở class controller level
    ]);

    // Nếu không định nghĩa Role (Tức là API public / Không bị Guard bởi Role)
    if (!requiredRoles) {
      return true;
    }

    // Lấy thông tin Request
    const { user } = context.switchToHttp().getRequest();

    // Yêu cầu user tồn tại trước (được inject qua AuthGuard('jwt'))
    if (!user) {
       return false;
    }

    // Check Role của user đang login có trong mảng requiredRoles không
    return requiredRoles.includes(user.role);
  }
}
