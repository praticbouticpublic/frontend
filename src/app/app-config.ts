import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  GoogleLoginProvider, SOCIAL_AUTH_CONFIG,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    importProvidersFrom(
      BrowserModule,
      SharedModule,
      NgbModule,
      MatProgressSpinnerModule,
      SocialLoginModule, // ✅ nécessaire
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: false,
        registrationStrategy: 'registerWhenStable:30000',
      }),
      NgxStripeModule.forRoot(environment.pkey)
    ),

    // ✅ correction : on fournit le token directement, pas une string
    {
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
    },

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideMessaging(() => getMessaging()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // HTTP & animations
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
};
