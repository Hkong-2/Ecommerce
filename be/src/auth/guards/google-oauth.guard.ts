import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const state = request.query.state as string;

    // Truyền giá trị state từ query (nếu có) sang cấu hình của Passport Google
    // Google sẽ nhận giá trị này và trả về y hệt trong callback
    return state ? { state } : {};
  }
}
