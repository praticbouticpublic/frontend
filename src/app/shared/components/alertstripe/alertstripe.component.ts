import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-alertstripe',
    templateUrl: './alertstripe.component.html',
    styleUrls: ['./alertstripe.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton]
})
export class AlertstripeComponent {
  dialogRef = inject<MatDialogRef<AlertstripeComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  onClick(): void {
    this.dialogRef.close();
  }

}
