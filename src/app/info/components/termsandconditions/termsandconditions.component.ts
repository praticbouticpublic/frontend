import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { Location } from '@angular/common';
import { MatCardActions } from '@angular/material/card';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-termsandconditions',
    templateUrl: './termsandconditions.component.html',
    styleUrls: ['./termsandconditions.component.scss'],
    imports: [MatCardActions, MatFabButton, MatIcon]
})
export class TermsandconditionsComponent {
  private router = inject(Router);
  dialog = inject(MatDialog);
  private location = inject(Location);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);


  type!: string;
  loadingstate = true;

  cancel()
  {
    this.location.back();
  }

  quittermenu() 
  {
    this.openQuitConfirmationDialog();
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }
}
