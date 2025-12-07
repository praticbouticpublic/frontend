import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModificationRoutingModule } from './modification-routing.module';
import { ChangificationComponent } from './components/changification/changification.component';
import { RadressingComponent } from './components/radressing/radressing.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        ModificationRoutingModule,
        SharedModule,
        ChangificationComponent,
        RadressingComponent
    ]
})
export class ModificationModule { }
