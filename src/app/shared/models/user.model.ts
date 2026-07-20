import { ApiResponse } from './common.model';

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  created_at?: string;
  total_scans?: number;
}

export interface UsersResponse extends ApiResponse<User[]> {
  status: string;
  count: number;
  data: User[];
}
