import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';













import { ActiveSubscriptionGuard } from './guards/activesubscription.guard';
import { IdentifiedGuard } from '../shared/guards/identified.guard';

const routes: Routes = [
    { path: '', loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent), children: [
        { path: '', redirectTo: 'products', pathMatch: 'full' },
        { path: 'tabs/:tabs', loadComponent: () => import('./components/tabs/tabs.component').then(m => m.TabsComponent), children: [
            { path: 'displaytable/:table', loadComponent: () => import('./components/displaytable/displaytable.component').then(m => m.DisplaytableComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'viewrecord/:table/:idtoup/:selcol/:selid', loadComponent: () => import('./components/viewrecord/viewrecord.component').then(m => m.ViewrecordComponent),canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'viewrecord/commande/:cmdid/viewrecord/:table/:idtoup/:selcol/:selid', loadComponent: () => import('./components/viewrecord/viewrecord.component').then(m => m.ViewrecordComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'updaterecord/:table/:idtoup/:selcol/:selid', loadComponent: () => import('./components/updaterecord/updaterecord.component').then(m => m.UpdaterecordComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'insertrecord/:table/:selcol/:selid', loadComponent: () => import('./components/insertrecord/insertrecord.component').then(m => m.InsertrecordComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'shop', loadComponent: () => import('./components/shop/shop.component').then(m => m.ShopComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'backoffice', loadComponent: () => import('./components/backoffice/backoffice.component').then(m => m.BackofficeComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'qrcodegenerator', loadComponent: () => import('./components/qrcodegenerator/qrcodegenerator.component').then(m => m.QrcodegeneratorComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] },
            { path: 'client', loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] } ] },
        { path: 'money', loadComponent: () => import('./components/money/money.component').then(m => m.MoneyComponent), canActivate: [ActiveSubscriptionGuard, IdentifiedGuard] } ] },
    { path: 'subscriptions', loadComponent: () => import('./components/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent), canActivate: [IdentifiedGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackRoutingModule { }
