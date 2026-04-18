import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

// ─── INTERFACES (swap these with your real API response types) ───────────────

export type UserRole   = 'Admin' | 'Field Agent' | 'Analyst' | 'Viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id:          string;
  full_name:   string;
  email:       string;
  region:      string;
  role:        UserRole;
  status:      UserStatus;
  joined_at:   string;       // ISO date string from API
  avatar_url?: string;       // optional — falls back to ui-avatars
  scan_count:  number;
}

export interface PaginationMeta {
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
}

// ─── DUMMY DATA (replace with real API call in loadUsers()) ──────────────────

const DUMMY_USERS: User[] = [
  { id:'u001', full_name:'Amadou Kone',      email:'amadou.kone@cacaomonitor.ci',     region:'Ivory Coast - West',   role:'Field Agent', status:'active',    joined_at:'2023-03-12', scan_count:142 },
  { id:'u002', full_name:'Fatima Ouedraogo', email:'fatima.o@cacaomonitor.bf',        region:'Burkina Faso - South', role:'Analyst',     status:'active',    joined_at:'2023-05-21', scan_count:89  },
  { id:'u003', full_name:'Kwame Asante',     email:'k.asante@cacaomonitor.gh',        region:'Ghana - Ashanti',      role:'Field Agent', status:'active',    joined_at:'2022-11-08', scan_count:231 },
  { id:'u004', full_name:'Marie Coulibaly',  email:'marie.c@cacaomonitor.ci',         region:'Ivory Coast - East',   role:'Viewer',      status:'inactive',  joined_at:'2023-01-15', scan_count:12  },
  { id:'u005', full_name:'Ibrahim Diallo',   email:'ibrahim.d@cacaomonitor.gn',       region:'Guinea - Central',     role:'Field Agent', status:'active',    joined_at:'2023-07-03', scan_count:178 },
  { id:'u006', full_name:'Aisha Mensah',     email:'aisha.m@cacaomonitor.gh',         region:'Ghana - Western',      role:'Admin',       status:'active',    joined_at:'2022-06-19', scan_count:0   },
  { id:'u008', full_name:'Nadia Bamba',      email:'nadia.b@cacaomonitor.ci',         region:'Ivory Coast - North',  role:'Analyst',     status:'active',    joined_at:'2023-09-14', scan_count:67  },
  { id:'u009', full_name:'Kofi Boateng',     email:'kofi.boateng@cacaomonitor.gh',    region:'Ghana - Brong-Ahafo',  role:'Field Agent', status:'active',    joined_at:'2022-12-01', scan_count:310 },
  { id:'u010', full_name:'Aminata Sangare',  email:'aminata.s@cacaomonitor.sn',       region:'Senegal - South',      role:'Viewer',      status:'inactive',  joined_at:'2023-04-10', scan_count:5   },
  { id:'u011', full_name:'Youssef Kamara',   email:'youssef.k@cacaomonitor.sl',       region:'Sierra Leone - East',  role:'Field Agent', status:'active',    joined_at:'2023-06-22', scan_count:98  },
  { id:'u012', full_name:'Grace Osei',       email:'grace.osei@cacaomonitor.gh',      region:'Ghana - Eastern',      role:'Analyst',     status:'active',    joined_at:'2023-08-05', scan_count:154 },
  { id:'u014', full_name:'Esi Agyeman',      email:'esi.agyeman@cacaomonitor.gh',     region:'Ghana - Volta',        role:'Viewer',      status:'active',    joined_at:'2023-10-17', scan_count:8   },
  { id:'u015', full_name:'Cheikh Ndiaye',    email:'cheikh.n@cacaomonitor.sn',        region:'Senegal - North',      role:'Field Agent', status:'active',    joined_at:'2023-03-25', scan_count:203 },
  { id:'u016', full_name:'Adama Barry',      email:'adama.barry@cacaomonitor.gn',     region:'Guinea - West',        role:'Admin',       status:'active',    joined_at:'2022-07-11', scan_count:0   },
];

const PAGE_SIZE = 8;

@Component({
  selector:    'app-user-management',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './user_management.component.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  users:          User[]         = [];
  filteredUsers:  User[]         = [];
  pagedUsers:     User[]         = [];

  search         = '';
  selectedRole   = 'All Roles';
  selectedStatus = 'All Status';

  currentPage = 1;
  totalPages  = 1;
  totalUsers  = 0;

  isLoading   = false;
  errorMsg    = '';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Debounce search input
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
    this.errorMsg  = '';
    this.cdr.markForCheck();

    // Simulate async API call
    setTimeout(() => {
      this.users     = DUMMY_USERS;
      this.isLoading = false;
      this.cdr.markForCheck();
      this.applyFilters();
    }, 400);
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  onSearchChange(): void {
    this.search$.next(this.search);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.search.trim().toLowerCase();

    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !term
        || u.full_name.toLowerCase().includes(term)
        || u.email.toLowerCase().includes(term)
        || u.region.toLowerCase().includes(term);

      const matchRole   = this.selectedRole   === 'All Roles'   || u.role   === this.selectedRole;
      const matchStatus = this.selectedStatus === 'All Status'  || u.status === this.selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });

    this.totalUsers = this.filteredUsers.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalUsers / PAGE_SIZE));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePage();
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  updatePage(): void {
    const start      = (this.currentPage - 1) * PAGE_SIZE;
    this.pagedUsers  = this.filteredUsers.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const delta = 2;
    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i === 1 || i === this.totalPages ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta)
      ) {
        pages.push(i);
      }
    }
    return pages;
  }

  showEllipsisBefore(page: number, idx: number): boolean {
    return idx > 0 && page - this.pageNumbers[idx - 1] > 1;
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  // TODO: Replace with real API calls

  viewUser(): void {
      this.router.navigate(['/dashboard/users']);
  }

  deleteUser(user: User): void {
    // TODO: this.userService.delete(user.id).subscribe(...)
    if (!confirm(`Delete ${user.full_name}?`)) return;
    this.users = this.users.filter(u => u.id !== user.id);
    this.applyFilters();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  avatarUrl(user: User): string {
    if (user.avatar_url) return user.avatar_url;
    const encoded = encodeURIComponent(user.full_name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&bold=true`;
  }

  statusClass(status: UserStatus): string {
    return {
      active:    'bg-green-100 text-green-700',
      inactive:  'bg-slate-100 text-slate-500',
      suspended: 'bg-red-100 text-red-600',
    }[status];
  }

  statusDotClass(status: UserStatus): string {
    return {
      active:    'bg-green-500',
      inactive:  'bg-slate-400',
      suspended: 'bg-red-500',
    }[status];
  }

  roleClass(role: UserRole): string {
    return {
      Admin:        'bg-purple-100 text-purple-700',
      'Field Agent':'bg-blue-100 text-blue-700',
      Analyst:      'bg-amber-100 text-amber-700',
      Viewer:       'bg-slate-100 text-slate-600',
    }[role];
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
