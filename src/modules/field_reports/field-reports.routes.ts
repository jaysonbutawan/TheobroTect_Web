import { Routes } from '@angular/router';

export const FIELD_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./field-reports.component').then((m) => m.FieldReportsComponent),
  },
  {
    path: 'black-pod',
    loadComponent: () =>
      import('./field-reports.component').then((m) => m.FieldReportsComponent),
  },
  {
    path: 'mealybug',
    loadComponent: () =>
      import('./field-reports.component').then((m) => m.FieldReportsComponent),
  },
  {
    path: 'pod-borer',
    loadComponent: () =>
      import('./field-reports.component').then((m) => m.FieldReportsComponent),
  },
];
