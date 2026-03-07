export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  status: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}