import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import { LayoutComponent } from '../modules/layouts/layout.components';
import { DashboardComponent } from '../modules/landing_page/dashboard.component';
import { UserManagementComponent } from '../modules/user_management/user_management.component';
import { HeatmapComponent } from '../modules/heatmap/heatmap.component'; 

// Correct imports for your new subfolders
import { BlackPodReportsComponent } from '../modules/field_reports/black_pod/black-pod-reports.component';
import { MealybugReportsComponent } from '../modules/field_reports/mealybug/mealybug-reports.component';
import { PodBorerReportsComponent } from '../modules/field_reports/pod_borer/pod-borer-reports.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'heatmap', component: HeatmapComponent },
      
      // Fixed Report Routes
      { path: 'field-reports/black-pod', component: BlackPodReportsComponent },
      { path: 'field-reports/mealybug', component: MealybugReportsComponent },
      { path: 'field-reports/pod-borer', component: PodBorerReportsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];