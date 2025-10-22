import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { strings } from 'src/app/shared/string';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatFabButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-radressing',
    templateUrl: './radressing.component.html',
    styleUrls: ['./radressing.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatFabButton]
})
export class RadressingComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(SocialAuthService);
  dialog = inject(MatDialog);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);
  private header = inject(HeaderService);


  loadingstate = true;
  radressingForm!: FormGroup;

  private clientId = environment.clientId;
  user!: import("@abacritt/angularx-social-login").SocialUser;
  loggedIn = false;

  get identifiant(): string
  {
    return this.radressingForm.value.identifiant;
  }

  get form() { return this.radressingForm.controls; }


  ngOnInit()
  {
    this.loadingstate = false;


    this.radressingForm = this.formBuilder.group({
      identifiant: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'), Validators.maxLength(255)]]
    });

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.user)
    });


  }

  async onSubmitRadressing($event: SubmitEvent)
  {
    if (this.radressingForm.status === 'VALID')
    {
      const dblemailpostData = {
        email: this.identifiant
      };

      this.httpClient.post<any>(environment.apiroot + 'verify-email', dblemailpostData, await this.header.buildHttpOptions())
      .subscribe({
        next:(data:any) => {
          this.header.setToken(data.token);
          if (data.result !== 'KO')
          {
            this.router.navigate(['admin/transfer/changification/' + this.identifiant]);
          }
          else
          {
            this.openDialog(strings.CantContinue, strings.MsgEmailAlreadyUsed);
          }
        },
        error:(err:any) => {
          this.openDialog(strings.ErrConnect, err.error.error);
        }
      });
    }
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  gotoAdmin()
  {
    this.router.navigate(['admin/backoffice/tabs/customerarea/backoffice']);
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

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }
}
