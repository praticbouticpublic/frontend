/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SharedModule } from './app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainModule } from './app/main/main.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxStripeModule } from 'ngx-stripe';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

// ✅ Import AngularFire functions
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

if (environment.production) {
  window.console.log = () => { }
}

bootstrapApplication(AppComponent, {
  providers: [
    // ✅ 1. Importer les modules classiques
    importProvidersFrom(
      MatProgressSpinnerModule,
      BrowserModule,
      AppRoutingModule,
      SharedModule,
      NgbModule,
      MainModule,
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: false,
        registrationStrategy: 'registerWhenStable:30000'
      }),
      NgxStripeModule.forRoot(environment.pkey),
    ),

    // ✅ 2. Ajouter ici les providers Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),

    // ✅ 3. Autres providers
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ]
});

