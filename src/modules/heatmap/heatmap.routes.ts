import { Routes } from '@angular/router';

export const HEATMAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./heatmap.component').then((m) => m.HeatmapComponent),
  },
];
