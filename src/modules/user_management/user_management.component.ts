import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { UsersApiService } from '../../app/core/services/api/users-api.service';
import { User, UsersResponse } from '../../app/shared/models';
import { PaginationComponent } from '../../app/shared/components/pagination/pagination.component';
import { ToastService } from '../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './user_management.component.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private usersApi: UsersApiService,
    private toastService: ToastService
  ) { }

  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];
  search = '';
  totalUsers = 0;
  isLoading = false;
  errorMsg = '';
  pageSize = 10;
  currentPage = 1;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
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

    this.cdr.markForCheck();

    this.usersApi.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: UsersResponse) => {
          this.users = res?.data ?? [];
          this.isLoading = false;
          this.applyFilters();
          this.cdr.markForCheck();
        },

        error: (err) => {
          this.errorMsg = 'Failed to load users';
          this.toastService.show('error', 'Load Failed', 'Could not load users from the server.');
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
    this.updatePagedUsers();
  }

  private updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalUsers / this.pageSize));
  }

  get pageStart(): number {
    return this.totalUsers === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalUsers);
  }

  goToPage(p: number): void {
    this.currentPage = p;
    this.updatePagedUsers();
  }

  viewUser(user: User): void {
  this.router.navigate(['/dashboard/users', user.id]);
}

  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.name}?`)) return;
    this.users = this.users.filter(u => u.id !== user.id);

    // If deleting the last item on the last page emptied it, step back a page.
    this.applyFilters();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.updatePagedUsers();
    }
  }


  formatDate(iso?: string): string {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
