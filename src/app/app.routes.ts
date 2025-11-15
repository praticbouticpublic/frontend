import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'admin/home', pathMatch: 'full' },
    { path: 'admin', redirectTo: 'admin/main', pathMatch: 'full' },
    { path: 'admin/exit', redirectTo: 'admin/logout', pathMatch: 'full' },
    { path: 'pushstart', redirectTo: 'admin/pushstart', pathMatch: 'full' },
    { path: 'admin', loadChildren: () => import('./main/main.module').then(m => m.MainModule) },
    { path: 'admin/creation', loadChildren: () => import('./creation/creation.module').then(m => m.CreationModule) },
    { path: 'admin/subscription', loadChildren: () => import('./subscription/subscription.module').then(m => m.SubscriptionModule) },
    { path: 'admin/info', loadChildren: () => import('./info/info.module').then(m => m.InfoModule) },
    { path: 'admin/backoffice', loadChildren: () => import('./back/back.module').then(m => m.BackModule) },
    { path: 'admin/backoffice/tabs/orders/displaytable/commande', loadChildren: () => import('./back/back.module').then(m => m.BackModule) },
    { path: 'admin/transfer', loadChildren: () => import('./modification/modification.module').then(m => m.ModificationModule) },
    { path: 'boutic', loadChildren: () => import('./front/front.module').then(m => m.FrontModule) },
    { path: ':customer/:method/:table', redirectTo: 'boutic/debut/:customer/:method/:table', pathMatch: 'full' },
    { path: ':customer', redirectTo: 'boutic/debut/:customer/3/0', pathMatch: 'full' }
];

