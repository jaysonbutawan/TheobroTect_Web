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

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}
