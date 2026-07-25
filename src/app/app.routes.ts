import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import { LayoutComponent } from '../modules/layout/layout.components';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [authGuard], // Protected route
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../modules/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('../modules/user_management/user-management.routes').then(
            (m) => m.USER_MANAGEMENT_ROUTES
          ),
      },
      {
        path: 'heatmap',
        loadChildren: () =>
          import('../modules/heatmap/heatmap.routes').then(
            (m) => m.HEATMAP_ROUTES
          ),
      },
      {
        path: 'field-reports',
        loadChildren: () =>
          import('../modules/field_reports/field-reports.routes').then(
            (m) => m.FIELD_REPORTS_ROUTES
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../modules/user_management/user_scan_history/user-scan-history.routes').then(
            (m) => m.USER_SCAN_HISTORY_ROUTES
          ),
      },
      {
        path: 'guide',
        loadChildren: () =>
          import('../modules/disease-guidance/disease-guidance.routes').then(
            (m) => m.DISEASE_GUIDANCE_ROUTES
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../modules/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
          ),
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];