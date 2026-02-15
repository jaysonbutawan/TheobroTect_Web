import { Routes } from '@angular/router';
import { LoginComponent } from '../modules/auth/login.component';
import { UserManagementComponent } from '../modules/user_management/user_management.component';

export const routes: Routes = [
     { path: '', component: LoginComponent },
     { path: 'user_management', component: UserManagementComponent }
];
