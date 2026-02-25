import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import { LayoutComponent } from '../modules/layouts/layout.components';
import { DashboardComponent } from '../modules/landing_page/dashboard.component';
import { UserManagementComponent } from '../modules/user_management/user_management.component';
import { HeatmapComponent } from '../modules/heatmap/heatmap.component'; 

// ONLY import the one consolidated component
import { FieldReportsComponent } from '../modules/field_reports/field-reports.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'heatmap', component: HeatmapComponent },
      
      // FIX: Add this base path so /dashboard/field-reports works
      { path: 'field-reports', component: FieldReportsComponent },

      // Keep these for now if you still want old URLs to work, 
      // but they are no longer strictly necessary if the sidebar link is simplified.
      { path: 'field-reports/black-pod', component: FieldReportsComponent },
      { path: 'field-reports/mealybug', component: FieldReportsComponent },
      { path: 'field-reports/pod-borer', component: FieldReportsComponent },
    ],
  },
  // This is what was catching you:
  { path: '**', redirectTo: '' },
];