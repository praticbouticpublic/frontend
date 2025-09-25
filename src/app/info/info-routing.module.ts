import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: 'termsandconditions', loadComponent: () => import('./components/termsandconditions/termsandconditions.component').then(m => m.TermsandconditionsComponent) },
  { path: 'termsandconditions/:type', loadComponent: () => import('./components/termsandconditions/termsandconditions.component').then(m => m.TermsandconditionsComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoRoutingModule { }
