import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, viewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import * as myGlobals from '../../../global';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import {HeaderService} from "../../../shared/services/header.service";


@Component({
    selector: 'app-forgotpassword',
    templateUrl: './forgotpassword.component.html',
    styleUrls: ['./forgotpassword.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError]
})
export class ForgotpasswordComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private HttpClient = inject(HttpClient);
  private header = inject(HeaderService);


  loadingstate = true;
  pwdForm: any;
  isSubmitted = false;
  readonly btnSubmit = viewChild.required<HTMLInputElement>('btnSubmit');

  ngOnInit(): void
  {
    this.pwdForm = this.formBuilder.group({
      courriel: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'), Validators.maxLength(255)]],
    });
    this.loadingstate = false;
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
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

  gotologin() {
    this.router.navigate(['admin/main']);
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  async onSubmit()
  {
    this.isSubmitted = true;
    if (!this.pwdForm.valid)
    {
      this.isSubmitted = false;
      return false;
    }
    else
    {
      const sendpwdpostData = {
        email: this.pwdForm.get('courriel')?.value,
      };

      this.HttpClient.post<any>(environment.apiroot + 'reset-password', sendpwdpostData, await this.header.buildHttpOptions())
      .subscribe({
        next:(data:any) => {
          if (data.result === 'OK')
          {
            this.openDialog(strings.PwdSending, strings.NewMsgPwd);
          }
          this.router.navigate(['admin/main']);
        },
        error:(err:any) => {
          this.openDialog(strings.ErrConnect, err.error.error);
          this.router.navigate(['admin/main']);
        }
      });
      return true;
    }
  }
}
