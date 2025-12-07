import {CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { SharedModule } from '../shared/shared.module';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import {GoogleLoginProvider, SOCIAL_AUTH_CONFIG} from '@abacritt/angularx-social-login';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';
import { SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { MainRoutingModule } from './main-routing.module';
import { LogoutComponent } from './components/logout/logout.component';
import { MaterialModule } from '../shared/material.module';
import { PushstartComponent } from './components/pushstart/pushstart.component';



@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [CommonModule,
        SharedModule,
        GoogleSigninButtonDirective,
        MainRoutingModule,
        MaterialModule,
        LoginComponent,
        ForgotpasswordComponent,
        LogoutComponent,
        PushstartComponent,
  ], providers: [{
    provide: SOCIAL_AUTH_CONFIG,
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '50443410557-ue38st3tkolo2lh32qefu6r3v36tjonq.apps.googleusercontent.com',
            { oneTapEnabled: false, prompt: 'consent' }
          ),
        },
      ],
      onError: (err: any) => console.error(err),
    } as SocialAuthServiceConfig,
  }


    ] })
export class MainModule { }
