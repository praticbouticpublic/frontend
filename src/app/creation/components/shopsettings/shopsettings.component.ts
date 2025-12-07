import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { CreationbouticService } from '../../../shared/services/creationboutic.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatCardActions } from '@angular/material/card';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-shopsettings',
    templateUrl: './shopsettings.component.html',
    styleUrls: ['./shopsettings.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatInput, MatRadioGroup, MatRadioButton, MatCardActions, MatFabButton, MatIcon]
})
export class ShopsettingsComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);
  private creabou = inject(CreationbouticService);
  private header = inject(HeaderService);

  shopsetFormGroup!: FormGroup<any>;
  loadingstate = true;
  isSubmitted = false;


  ngOnInit()
  {
    this.shopsetFormGroup = this.formBuilder.group({
      chxmethode: ['TOUS', [Validators.required]],
      chxpaie: ['TOUS', [Validators.required]],
      mntmincmd: [1, [Validators.required]],
      validsms: ['on', [Validators.required]],
    });
    this.loadingstate = false;
  }

  async onSubmitShopsettings() {
    this.isSubmitted = true;
    this.loadingstate = true;
    this.creabou.setParametre(this.shopsetFormGroup.value.chxmethode, this.shopsetFormGroup.value.chxpaie,
      this.shopsetFormGroup.value.mntmincmd, this.shopsetFormGroup.value.validsms === 'on');
      let obj = {
        chxmethode: this.shopsetFormGroup.value.chxmethode,
        chxpaie: this.shopsetFormGroup.value.chxpaie,
        mntmincmd: this.shopsetFormGroup.value.mntmincmd,
        validsms: (this.shopsetFormGroup.value.validsms === 'on') ? '1' : '0'
      };

      this.httpClient.post<any>(environment.apiroot + 'boutic-configure', obj, await this.header.buildHttpOptions()).subscribe({
        next:(data:any) => {
          this.header.setToken(data.token);
          if (data.result === "OK")
          {
            if (environment.formulechoice === 3)
              this.router.navigate(['admin/subscription/subscriptionchoice/init']);
            else
              this.router.navigate(['admin/subscription/paymentdetails/init']);
          }
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
          this.isSubmitted = false;
        }
      });

  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'yes') {
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }
  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate(['admin/main'])
    });
  }

}
