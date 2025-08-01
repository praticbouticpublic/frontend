import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from './components/dialog/dialog.component';
import { AlertstripeComponent } from './components/alertstripe/alertstripe.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { FirebaseModule } from './firebase.module';
import { NgOptimizedImage } from '@angular/common';


@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        MaterialModule,
        NgxScannerQrcodeModule,
        FirebaseModule,
        DialogComponent, ConfirmationComponent, AlertstripeComponent,
    ],
    exports: [
        ReactiveFormsModule,
        MaterialModule,
        NgxScannerQrcodeModule,
        FirebaseModule,
    ]
})
export class SharedModule { }
