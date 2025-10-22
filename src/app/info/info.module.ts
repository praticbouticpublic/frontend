import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfoRoutingModule } from './info-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TermsandconditionsComponent } from './components/termsandconditions/termsandconditions.component';


@NgModule({
    imports: [
        CommonModule,
        InfoRoutingModule,
        SharedModule,
        TermsandconditionsComponent
    ]
})
export class InfoModule { }
