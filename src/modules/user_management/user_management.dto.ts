
export interface UserDto {
  id: string;
  fullName: string;
  address?: string;
  contact_number?: string;
  email: string;
  role?: string;
  created_at?: string;
  deleted_at?: string;
  approved_at?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface ListUsersQuery {
  q?: string;
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
}
