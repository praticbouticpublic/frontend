import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material.module';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'main', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'forgotpassword', loadComponent: () => import('./components/forgotpassword/forgotpassword.component').then(m => m.ForgotpasswordComponent) },
  { path: 'logout', loadComponent: () => import('./components/logout/logout.component').then(m => m.LogoutComponent) },
  { path: 'pushstart', loadComponent: () => import('./components/pushstart/pushstart.component').then(m => m.PushstartComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, MaterialModule, ReactiveFormsModule],
  exports: [RouterModule, SharedModule, MaterialModule, ReactiveFormsModule]
})
export class MainRoutingModule { }
