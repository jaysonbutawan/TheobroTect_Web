import { Routes } from '@angular/router';

export const DISEASE_GUIDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./diease-guidance.component').then((m) => m.DiseaseGuidanceComponent),
  },
];
