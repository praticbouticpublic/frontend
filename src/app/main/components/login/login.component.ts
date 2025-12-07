import {Component, NgZone, inject, Injectable, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule }  from '@angular/forms';
import { Router } from '@angular/router';
import { SocialAuthService, GoogleSigninButtonDirective } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { Logininfo } from '../../../shared/models/logininfo';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { strings } from 'src/app/shared/string';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModeleService } from 'src/app/back/services/model.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PushNotificationService } from 'src/app/shared/services/pushnotif.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatSuffix, MatFabButton, GoogleSigninButtonDirective],
  standalone:true
})

export class LoginComponent implements OnInit
{
  public formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public authService = inject(SocialAuthService);
  public authentication = inject(AuthenticationService);
  dialog = inject(MatDialog);
  public zone = inject(NgZone);
  public lginf = inject(LogininfoService);
  public httpClient = inject(HttpClient);
  public model = inject(ModeleService);
  public msg = inject(MessageService);
  public snackBar = inject(MatSnackBar);
  public pushnotif = inject(PushNotificationService);
  public header =  inject(HeaderService);



  logout = false;
  loadingstate = false;
  loginForm: any = FormGroup;
  user: any;
  loggedIn: any;
  loginDenied = false;
  hide = true;
  subscription!:any;
  authentification!:any;
  isSubmitted = false;
  shown = false;
  version = environment.version;
  environ = environment.environ;
  prod =  environment.production;

  private clientId = environment.clientId;
  responsePayload!: any;

  get identifiant(): string
  {
    return this.loginForm.value.identifiant;
  }

  get motdepasse(): string
  {
    return this.loginForm.value.motdepasse;
  }

  get form() { return this.loginForm.controls; }

  ngOnInit()
  {

    this.loginForm = this.formBuilder.group({
      identifiant: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'), Validators.maxLength(255)]],
      motdepasse: ['', [Validators.required, Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*?]).{8,}'),
      Validators.maxLength(255)]]
    });

    this.subscription = this.router.events.subscribe((event) => {
      this.authentification = this.authService.authState.subscribe((user) => {
        this.user = user;
        this.loggedIn = (user != null);
        if (this.loggedIn)
        {
          this.logWithGoogle(this.user);
        }
      });
    });
  }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
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
                    next:(data:any) => {
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

  async submitId(id:string)
  {
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
          this.lginf.setIdentifiant(id);
          if (this.loggedIn)
            this.router.navigate(['admin/creation/registrationdetails'], {replaceUrl: true});
          else
            this.router.navigate(['admin/creation/identification'], {replaceUrl: true});
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

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  gocreerboutique()
  {
    this.authService.signOut();
    this.isSubmitted = true;
    this.subscription.unsubscribe();
    this.authentification.unsubscribe();
    this.router.navigate(['admin/creation/registration']);
  }


  gotoforgotpassword()
  {
    this.isSubmitted = true;
    this.subscription.unsubscribe();
    this.router.navigate(['admin/forgotpassword']);
  }

  onSubmitLogin($event: Event)
  {

    if (this.loginForm.invalid) {
      this.openDialog(strings.ErrConnect, strings.InvalidCredentials);
      return;
    }
    this.isSubmitted = true;
    this.authentication.processLogin(
      this.form.identifiant.value,
      this.form.motdepasse.value
        ).then(obs1 =>{
      obs1.subscribe({ next:(v: Logininfo) => {
          if (v.bouticid !== 0)
          {
            this.pushnotif._getDeviceToken().then(async token => {
              const obj = { bouticid: v.bouticid, action:'setClientProp', table:'', prop:'device_id', valeur:token };
              this.httpClient.post<string>(environment.apiroot + 'set-client-prop', obj, await this.header.buildHttpOptions()).subscribe({
                next:async (data:string) => {
                  const obj = { bouticid: v.bouticid, action:'setClientProp', table:'', prop:'device_type', valeur:0 };
                  this.httpClient.post<string>(environment.apiroot + 'set-client-prop', obj, await this.header.buildHttpOptions()).subscribe({
                    next:(data:string) => {
                      this.zone.run(() => {
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
          {
            this.isSubmitted = false;
            this.openDialog(strings.CantContinue, strings.MessageUnknownCredentials);
          }
        }, error:(e: any) =>
        {
          this.isSubmitted = false;
          this.openDialog(strings.ErrConnect, e.error.error);
        }
      });
      })

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
        this.loadingstate = true;
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }

  ngOnDestroy(): void {
    //this.authentification.unsubscribe();
    this.subscription.unsubscribe();
  }

  goToHome()
  {
    this.isSubmitted = true;
    this.subscription.unsubscribe();
    //this.authentification.unsubscribe();
    this.router.navigate(['admin/home']);
  }

}


