import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import { LayoutComponent } from '../modules/layout.components';
import { DashboardComponent } from '../modules/landing_page/dashboard.component';
import { UserManagementComponent } from '../modules/user_management/user_management.component';
import { HeatmapComponent } from '../modules/heatmap/heatmap.component';

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

      { path: 'field-reports', component: FieldReportsComponent },

      { path: 'field-reports/black-pod', component: FieldReportsComponent },
      { path: 'field-reports/mealybug', component: FieldReportsComponent },
      { path: 'field-reports/pod-borer', component: FieldReportsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];