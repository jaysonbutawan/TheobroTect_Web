import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import { User, UsersResponse } from '../../../../app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersApiService extends BaseApiService {
  protected endpoint = '/users';

  getUsers(): Observable<UsersResponse> {
    return this.get<UsersResponse>('');
  }

  getUserById(id: number): Observable<User> {
    return this.get<User>(`/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.post<User>('', user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.put<User>(`/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`/${id}`);
  }
}
