import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from './components/dialog/dialog.component';
import { AlertstripeComponent } from './components/alertstripe/alertstripe.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';



@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        MaterialModule,

        DialogComponent, ConfirmationComponent, AlertstripeComponent,
    ],
    exports: [
        ReactiveFormsModule,
        MaterialModule,

    ]
})
export class SharedModule { }
