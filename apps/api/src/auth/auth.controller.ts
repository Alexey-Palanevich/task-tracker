import { Body, Controller, Post } from '@nestjs/common';
import type {
  LoginBody,
  RegisterBody,
} from '@task-tracker/types';

@Controller('auth')
export class AuthController {
  @Post('register')
  // FR-9.1: Local authentication (email/password)
  register(@Body() _body: RegisterBody) {
    // Implementation will be added in the tasks module and user persistence layer.
    return { status: 'not_implemented' } as const;
  }

  @Post('login')
  // FR-9.1: Local authentication (email/password)
  login(@Body() _body: LoginBody) {
    return { status: 'not_implemented' } as const;
  }
}

