import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import {LayoutComponent } from '../modules/layouts/layout.components';
import { DashboardComponent } from '../modules/landing_page/dashboard.component';
import { UserManagementComponent } from '../modules/user_management/user_management.component';


export const routes: Routes = [
  { path: '', component: LoginComponent },

  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'user-management', component: UserManagementComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];
