import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontRoutingModule } from './front-routing.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../shared/material.module';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CarteComponent } from './components/carte/carte.component';
import { GetinfoComponent } from './components/getinfo/getinfo.component';
import { PaiementComponent } from './components/paiement/paiement.component';
import { DebutComponent } from './components/debut/debut.component';
import { ErrorComponent } from './components/error/error.component';
import { FinComponent } from './components/fin/fin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxStripeModule, StripeElementsDirective, StripePaymentElementComponent } from 'ngx-stripe';
import { MatInputModule } from '@angular/material/input';


@NgModule({
    imports: [CommonModule,
        FrontRoutingModule,
        MatProgressSpinnerModule,
        MaterialModule,
        NgbCarouselModule,
        ReactiveFormsModule,
        FrontRoutingModule,
        SharedModule,
        NgxStripeModule,
        ReactiveFormsModule,
        MatInputModule,
        StripeElementsDirective,
        StripePaymentElementComponent, CarteComponent,
        GetinfoComponent,
        PaiementComponent,
        DebutComponent,
        ErrorComponent,
        FinComponent], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class FrontModule { }
