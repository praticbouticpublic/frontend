import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreationRoutingModule } from './creation-routing.module';
import { IdentficationComponent } from './components/identfication/identfication.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { RegistrationdetailsComponent } from './components/registrationdetails/registrationdetails.component';
import { ShopdetailsComponent } from './components/shopdetails/shopdetails.component';
import { ShopsettingsComponent } from './components/shopsettings/shopsettings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { GoogleLoginProvider, GoogleSigninButtonDirective, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';

@NgModule({
    imports: [CommonModule,
        CreationRoutingModule,
        SharedModule,
        GoogleSigninButtonDirective, IdentficationComponent,
        RegistrationComponent,
        RegistrationdetailsComponent,
        ShopdetailsComponent,
        ShopsettingsComponent], providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider('50443410557-ue38st3tkolo2lh32qefu6r3v36tjonq.apps.googleusercontent.com', { oneTapEnabled: false, prompt: 'consent' })
                    }
                ],
                onError: (err) => {
                    console.error(err);
                }
            } as SocialAuthServiceConfig,
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class CreationModule { }
