import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionchoiceComponent } from './components/subscriptionchoice/subscriptionchoice.component';
import { PaymentdetailsComponent } from './components/paymentdetails/paymentdetails.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxStripeModule, StripeElementsDirective, StripePaymentElementComponent } from 'ngx-stripe';


@NgModule({
    imports: [CommonModule,
        SubscriptionRoutingModule,
        SharedModule,
        NgxStripeModule,
        ReactiveFormsModule,
        MatInputModule,
        StripeElementsDirective,
        StripePaymentElementComponent, SubscriptionchoiceComponent,
        PaymentdetailsComponent], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class SubscriptionModule { }
