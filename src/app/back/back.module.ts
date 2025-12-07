import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackRoutingModule } from './back-routing.module';
import { LayoutComponent } from './components/layout/layout.component'
import { NavbarComponent } from './components/navbar/navbar.component';
import { DisplaytableComponent } from './components/displaytable/displaytable.component';
import { InsertrecordComponent } from './components/insertrecord/insertrecord.component';
import { UpdaterecordComponent } from './components/updaterecord/updaterecord.component';
import { CustomerareaComponent } from './components/customerarea/customerarea.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { ShopComponent } from './components/shop/shop.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BackofficeComponent } from './components/backoffice/backoffice.component';
import { SharedModule } from '../shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ViewrecordComponent } from './components/viewrecord/viewrecord.component';
import { PresentationrecordComponent } from './components/presentationrecord/presentationrecord.component';
import { PresentationtableComponent } from './components/presentationtable/presentationtable.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { MoneyComponent } from './components/money/money.component';
import { QrcodegeneratorComponent } from './components/qrcodegenerator/qrcodegenerator.component';
import { ClientComponent } from './components/client/client.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { CapitalizeFirstPipe } from './pipes/capitalize.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
    exports: [], imports: [CommonModule,
        BackRoutingModule,
        SharedModule,
        NgbNavModule,
        NgbCarouselModule, LayoutComponent,
        NavbarComponent,
        DisplaytableComponent,
        InsertrecordComponent,
        UpdaterecordComponent,
        CustomerareaComponent,
        SubscriptionsComponent,
        ShopComponent,
        SettingsComponent,
        BackofficeComponent,
        ViewrecordComponent,
        PresentationrecordComponent,
        PresentationtableComponent,
        MoneyComponent,
        QrcodegeneratorComponent,
        ClientComponent,
        TabsComponent,
        CapitalizeFirstPipe], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class BackModule { }
