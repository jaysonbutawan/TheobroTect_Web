// user-management.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-user_management',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <p class="text-slate-500 mt-2">Manage your users here.</p>
    </div>
  `
})
export class UserManagementComponent {}
