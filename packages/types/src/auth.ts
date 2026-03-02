/**
 * Auth API contracts (FR-9).
 */

import type { UserPublic } from './user.ts';

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface MeResponse {
  user: UserPublic;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}

export interface RefreshBody {
  refresh_token: string;
}
