import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../environments/environment.prod";
import { CreateUserDto, ListUsersQuery, UpdateUserDto, UserDto } from "./user_management.dto";


@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/users`;

  list(query: ListUsersQuery = {}) {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<UserDto[]>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUserDto) {
    return this.http.post<UserDto>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateUserDto) {
    return this.http.put<UserDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}