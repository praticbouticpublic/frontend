import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from './../../environments/environment';


@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()), // 👈👈👈 importing messaging module
  ]
})

export class FirebaseModule { }
