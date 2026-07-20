import { Routes } from '@angular/router';

export const USER_SCAN_HISTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user_scan_history.component').then((m) => m.ScanHistoryComponent),
  },
];
