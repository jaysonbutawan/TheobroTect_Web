import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../environments/environment.prod";
import { UsersResponseDto } from "./user_management.dto";


@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/users`;


  getUsers() {
    return this.http.get<UsersResponseDto>(`${this.baseUrl}`);
  }
}
