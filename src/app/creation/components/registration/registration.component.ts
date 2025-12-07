import {Component, inject, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { SocialAuthService, GoogleSigninButtonDirective } from "@abacritt/angularx-social-login";
import { environment } from 'src/environments/environment';
import { SocialUser } from "@abacritt/angularx-social-login";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { strings } from 'src/app/shared/string';
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatLabel, MatFormField, MatInput, MatError } from '@angular/material/input';
import { MatFabButton } from '@angular/material/button';
import {Logininfo} from "../../../shared/models/logininfo";
import {AuthenticationService} from "../../../shared/services/authentication.service";
import {ModeleService} from "../../../back/services/model.service";
import {MessageService} from "../../../shared/services/message.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PushNotificationService} from "../../../shared/services/pushnotif.service";
import {HeaderService} from "../../../shared/services/header.service";


@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatLabel, MatFormField, MatInput, MatError, MatFabButton, GoogleSigninButtonDirective]
})
export class RegistrationComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(SocialAuthService);
  dialog = inject(MatDialog);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);
  private authentication = inject(AuthenticationService);
  private zone = inject(NgZone);
  private lginf = inject(LogininfoService);
  private model = inject(ModeleService);
  private msg = inject(MessageService);
  private snackBar = inject(MatSnackBar);
  private pushnotif = inject(PushNotificationService);
  private header = inject(HeaderService);


  loadingstate = true;
  registrationForm!: FormGroup;

  private clientId = environment.clientId;
  user!: import("@abacritt/angularx-social-login").SocialUser;
  loggedIn = false;
  subscription!:any;
  authentification!:any;

  get identifiant(): string
  {
    return this.registrationForm.value.identifiant;
  }

  get form() { return this.registrationForm.controls; }


  ngOnInit()
  {
    this.loadingstate = false;
    this.registrationForm = this.formBuilder.group({
      identifiant: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'), Validators.maxLength(255)]]
    });
    this.subscription = this.router.events.subscribe((event) => {
      this.authentification = this.authService.authState.subscribe((user) => {
        this.user = user;
        this.loggedIn = (user != null);
        this.submitId(this.user.email);
      });
    });
  }

  cancel()
  {
    throw new Error('Method not implemented.');
  }

  async onSubmitRegistration($event: SubmitEvent)
  {
    if (this.registrationForm.status === 'VALID')
    {
      await this.submitId(this.identifiant);
    }
    else
      this.openDialog(strings.ErrConnect, strings.MsgEmailInvalid);

  }

  async submitId(id: string | undefined) {
    this.subscription.unsubscribe();

    const dblemailpostData = {
      email: id
    };

    this.httpClient.post<any>(environment.apiroot + 'verify-email', dblemailpostData, await this.header.buildHttpOptions())
    .subscribe({
      next:(data:any) => {
        this.header.setToken(data.token);
        if (data.result !== 'KO')
        {
          this.lginfser.setIdentifiant(id);
          if (this.loggedIn)
            this.router.navigate(['admin/creation/registrationdetails'], {replaceUrl: true});
          else
            this.router.navigate(['admin/creation/identification'], {replaceUrl: true});
        }
        else
        {

          if (this.loggedIn)
            this.logWithGoogle(this.user);
          else
            this.openDialog(strings.CantContinue, strings.MsgEmailAlreadyUsed);
        }
      },
      error:(err:any) => {
        this.openDialog(strings.ErrConnect, err.error.error);
      }
    });

  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  gotoAdmin()
  {
    this.router.navigate(['admin/main']);
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

  ngOnDestroy(): void {
    this.authentification.unsubscribe();
    this.subscription.unsubscribe();
  }

  logWithGoogle(token: any)
  {
    if (!token) return;

    this.authentication.processGoogleLogin(token.email).then(observable =>{
      observable.subscribe({
        next:(v: Logininfo) => {
          if (v.bouticid !== 0)
          {
            this.pushnotif._getDeviceToken().then(async tok => {
              const obj = { bouticid: v.bouticid, action:'setClientProp', table:'', prop:'device_id', valeur:tok };
              this.httpClient.post<any>(environment.apiroot + 'set-client-prop', obj, await this.header.buildHttpOptions()).subscribe({
                next:async (data:any) => {
                  const obj = { bouticid: v.bouticid, action:'setClientProp', table:'', prop:'device_type', valeur:0 };
                  this.httpClient.post<any>(environment.apiroot + 'set-client-prop', obj, await this.header.buildHttpOptions()).subscribe({
                    next:async (data:any) => {
                      this.zone.run(() => {
                        this.authentification.unsubscribe();
                        this.subscription.unsubscribe();
                        let lasturl = localStorage.getItem('lasturl_' + this.lginf.getBouticId()) ?? '';
                        //if (lasturl === '')
                        this.router.navigate(['admin/backoffice/tabs/products/displaytable/article']);
                        //else
                        //  this.router.navigate([lasturl]);
                      });
                    },
                    error:(e: any) =>
                    {
                      this.openDialog(strings.ErrConnect, e.error.error);
                    }
                  });
                },
                error:(e: any) =>
                {
                  this.openDialog(strings.ErrConnect, e.error.error);
                }
              });
            });
          }
          else
            this.submitId(token.email);
        },
        error:(e:any) => {
          this.openDialog(strings.ErrConnect, e.error.error);
        }
      });
    })

  }
}
