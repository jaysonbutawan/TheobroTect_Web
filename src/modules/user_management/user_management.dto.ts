export interface UserDto {
  id: number;
  name: string;
  email: string;
  address?: string;
  created_at?: string;
  total_scans?: number;
}

export interface UsersResponseDto {
  status: string;
  count: number;
  data: UserDto[];
}
