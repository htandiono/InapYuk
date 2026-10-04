import type { AuthProvider, UserRole } from './enums';

/** Owner: Feature 1 (awanstywn). Consumed by Feature 2 for the session user. */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  provider: AuthProvider;
  isVerified: boolean;
  avatarUrl: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
}

export interface RegisterRequest {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface TenantRegisterRequest extends RegisterRequest {
  companyName: string;
  companyAddress?: string;
}

export interface VerifyAndSetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface ChangeEmailRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
