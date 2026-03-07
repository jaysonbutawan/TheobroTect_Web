import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { UsersApiService } from '../user_management/api.service';
import { UserDto } from '../user_management/user_management.dto';

@Component({
  selector: 'app-user_management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user_management.component.html'
})
export class UserManagementComponent implements OnInit {
 private usersApi = inject(UsersApiService);

  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];

  search = '';
  selectedRole = '';
  selectedStatus = '';

  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadUsers();
  }

loadUsers(): void {
  this.loading = true;
  this.error = '';

  this.usersApi.list({
    q: this.search,
    role: this.selectedRole,
    isActive:
      this.selectedStatus === 'active'
        ? true
        : this.selectedStatus === 'inactive'
        ? false
        : undefined
  }).subscribe({
    next: (response) => {
      this.users = response;
      this.filteredUsers = response;
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load users', err);
      this.error = 'Failed to load users.';
      this.loading = false;
    }
  });
}

  onSearchChange(): void {
    this.loadUsers();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  deleteUser(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    this.usersApi.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== id);
        this.filteredUsers = this.filteredUsers.filter(user => user.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        alert('Failed to delete user.');
      }
    });
  }

  trackByUserId(index: number, user: UserDto): string {
    return user.id;
  }
}
