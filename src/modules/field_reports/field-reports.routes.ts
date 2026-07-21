import { Routes } from '@angular/router';

export const FIELD_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./field-reports.component').then((m) => m.FieldReportsComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./field-report-detail.component').then((m) => m.FieldReportDetailComponent),
  },
];
