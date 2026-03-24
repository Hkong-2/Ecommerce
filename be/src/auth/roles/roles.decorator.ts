import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';

/**
 * Decorator dùng để gán metadata Roles lên các Route Handler cần phân quyền
 * @param roles Các Role (enum) được phép truy cập
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
