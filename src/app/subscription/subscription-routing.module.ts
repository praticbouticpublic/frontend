import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const routes: Routes = [
  { path: 'subscriptionchoice/:type', loadComponent: () => import('./components/subscriptionchoice/subscriptionchoice.component').then(m => m.SubscriptionchoiceComponent) },
  { path: 'paymentdetails/:type', loadComponent: () => import('./components/paymentdetails/paymentdetails.component').then(m => m.PaymentdetailsComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
