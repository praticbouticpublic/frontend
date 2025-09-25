import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';






const routes: Routes = [
  { path: 'registration', loadComponent: () => import('./components/registration/registration.component').then(m => m.RegistrationComponent) },
  { path: 'identification', loadComponent: () => import('./components/identfication/identfication.component').then(m => m.IdentficationComponent) },
  { path: 'registrationdetails', loadComponent: () => import('./components/registrationdetails/registrationdetails.component').then(m => m.RegistrationdetailsComponent) },
  { path: 'shopdetails', loadComponent: () => import('./components/shopdetails/shopdetails.component').then(m => m.ShopdetailsComponent) },
  { path: 'shopsettings', loadComponent: () => import('./components/shopsettings/shopsettings.component').then(m => m.ShopsettingsComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreationRoutingModule { }
