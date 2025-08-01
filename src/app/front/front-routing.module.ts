import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';








const routes: Routes = [
  { path: ':customer/:method/:table', redirectTo: 'debut/:customer/:method/:table', pathMatch: 'full' },
  { path: ':customer', redirectTo: 'boutic/debut/:customer/3/0', pathMatch: 'full' },
  { path: 'debut/:customer/:method/:table', loadComponent: () => import('./components/debut/debut.component').then(m => m.DebutComponent) },
  { path: 'carte', loadComponent: () => import('./components/carte/carte.component').then(m => m.CarteComponent) },
  { path: 'getinfo', loadComponent: () => import('./components/getinfo/getinfo.component').then(m => m.GetinfoComponent)},
  { path: 'paiement', loadComponent: () => import('./components/paiement/paiement.component').then(m => m.PaiementComponent)},
  { path: 'fin', loadComponent: () => import('./components/fin/fin.component').then(m => m.FinComponent) },
  { path: 'error', loadComponent: () => import('./components/error/error.component').then(m => m.ErrorComponent)}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontRoutingModule { }
