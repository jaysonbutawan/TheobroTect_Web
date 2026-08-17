export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export type ChangePasswordStatus =
  | 'OK'
  | 'INVALID_CURRENT_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'NOT_ADMIN'
  | 'ACCOUNT_DELETED';

export interface ChangePasswordResponse {
  status: ChangePasswordStatus;
  message?: string;
}
