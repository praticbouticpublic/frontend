import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { IdentifiedGuard } from 'src/app/shared/guards/identified.guard';

const routes: Routes = [
  { path: 'radressing', loadComponent: () => import('./components/radressing/radressing.component').then(m => m.RadressingComponent), canActivate: [IdentifiedGuard] },
  { path: 'changification/:courriel', loadComponent: () => import('./components/changification/changification.component').then(m => m.ChangificationComponent), canActivate: [IdentifiedGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModificationRoutingModule { }
