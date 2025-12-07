import { inject, Injectable, NgZone } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Router } from '@angular/router';
import { LogininfoService } from './logininfo.service';
import { HttpClient } from '@angular/common/http';
import { strings } from '../string';
import { DialogComponent } from '../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {AuthenticationService} from "./authentication.service";
import {HeaderService} from "./header.service";


@Injectable({
  providedIn: 'root'
})

export class PushNotificationService {
  private swPush = inject(SwPush);
  private router = inject(Router);
  private lginf = inject(LogininfoService);
  private httpClient = inject(HttpClient);
  private zone = inject(NgZone);
  dialog = inject(MatDialog);
  private authentication = inject(AuthenticationService);
  private header = inject(HeaderService);


  static startfromnotif = false;
  registred = false;


  getStartFromNotif():boolean
  {
    return PushNotificationService.startfromnotif;
  }

  setStartFromNotif(state:boolean)
  {
    PushNotificationService.startfromnotif = state;
  }

  private _messaging = inject(Messaging);

  constructor() {
        console.log('Service Worker supported:', 'serviceWorker' in navigator);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('Firebase Service Worker registered with scope:', registration.scope);
            navigator.serviceWorker.addEventListener("message", (event1: any) => {
              if (!PushNotificationService.startfromnotif)
              {
                console.log("serviceWorker message: ", { event1 });
                const notification = new Notification(event1.data.notification.title, {
                  body: event1.data.notification.body,
                });
                notification.onclick = (event2) => {
                  this._getDeviceToken().then(async token => {
                    let bouticid = this.lginf.getBouticId();
                    const obj = { requete:'getclientprop', bouticid, param:'device_id' };
                    this.httpClient.post<any>(environment.apiroot + 'front', obj, await this.header.buildHttpOptions()).subscribe({
                      next:(data:any) => {
                        if (this.lginf.getLogged(false) && (data[0] === token))
                          this.router.navigate(['/admin/backoffice/tabs/orders/displaytable/commande']);
                        else if (data[0] === token)
                          window.open(window.location.protocol + '//' + window.location.host + '/admin/main', '_blank');
                        else
                           this.router.navigate(['/admin/main']);
                      },
                      error:(e: any) =>
                      {
                        this.openDialog(strings.ErrConnect, e.error.error);
                      }
                    });
                  });
                }
              }
              else
                this.setStartFromNotif(false);
            });
          }).catch(function(err) {
            console.log('Service Worker registration failed:', err);
          });
        }
      }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    });
  }

  subscribeToNotifications() {

    if (!('serviceWorker' in navigator)) {
      console.error('Service workers are not supported by this browser.');
      return;
    }

      const sub = this.swPush.requestSubscription({
        serverPublicKey: environment.firebase.vapidKey
      }).then(sub => {
        // TODO: Send subscription object to the server
      console.log('Successfully subscribed to notifications:', sub);
      }).catch(err => {
        console.error('Subscription failed:', err);
      });
  }

  _getDeviceToken(): Promise<any> {
    return getToken(this._messaging, { vapidKey: environment.firebase.vapidKey });
  }

  _onMessage(): void {
    onMessage(this._messaging, (payload) => {
      console.log('Message clicked from angular service : ', payload);
      // window.open(payload.fcmOptions?.link, '_blank');
    });
  }
}
