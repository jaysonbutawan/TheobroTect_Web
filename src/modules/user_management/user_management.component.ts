import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { UsersApiService } from './api.service';
import { UserDto, UsersResponseDto } from './user_management.dto';
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user_management.component.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private usersApi: UsersApiService
  ) { }

  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  search = '';
  totalUsers = 0;
  isLoading = false;
  errorMsg = '';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 loadUsers(): void {
  this.isLoading = true;
  this.errorMsg = '';

  console.log('🚀 Loading users from API...');

  this.cdr.markForCheck();

  this.usersApi.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: UsersResponseDto) => {

        console.log('✅ API RESPONSE RECEIVED:', res);

        this.users = res?.data ?? [];

        console.log('👥 Users loaded:', this.users.length);
        console.table(this.users);

        this.isLoading = false;
        this.applyFilters();

        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error('❌ USERS API ERROR:', err);

        this.errorMsg = 'Failed to load users';
        this.isLoading = false;

        this.cdr.markForCheck();
      }
    });
}

  onSearchChange(): void {
    this.search$.next(this.search);
  }

  applyFilters(): void {
    const term = this.search.trim().toLowerCase();

    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !term
        || u.name?.toLowerCase().includes(term)
        || u.email?.toLowerCase().includes(term)
        || u.address?.toLowerCase().includes(term);
      return matchSearch;
    });

    this.totalUsers = this.filteredUsers.length;

  }

  viewUser(): void {
    this.router.navigate(['/dashboard/users']);
  }

  deleteUser(user: UserDto): void {
    if (!confirm(`Delete ${user.name}?`)) return;
    this.users = this.users.filter(u => u.id !== user.id);
    this.applyFilters();
  }

  avatarUrl(user: UserDto): string {
    const encoded = encodeURIComponent(user.name || 'Unknown');
    return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&bold=true`;
  }


  formatDate(iso?: string): string {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
