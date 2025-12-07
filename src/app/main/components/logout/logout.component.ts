import {SocialAuthService, GoogleSigninButtonDirective, GoogleLoginProvider} from "@abacritt/angularx-social-login";
import { CUSTOM_ELEMENTS_SCHEMA, Component, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { strings } from 'src/app/shared/string';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Initialisation } from 'src/app/back/initialisation';
import { MessageService } from 'src/app/shared/services/message.service';
import { ModeleService } from 'src/app/back/services/model.service';
import { ActiveSubscriptionService } from 'src/app/shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {catchError, of} from "rxjs";
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    imports: [MatProgressSpinner]
})

export class LogoutComponent extends Initialisation   {
  private _ngZone = inject(NgZone);
  private authService = inject(SocialAuthService);


  zone: any;
  constructor() {
      const router = inject(Router);
      const lginf = inject(LogininfoService);
      const httpClient = inject(HttpClient);
      const dialog = inject(MatDialog);
      const msg = inject(MessageService);
      const model = inject(ModeleService);
      const activesub = inject(ActiveSubscriptionService);
      const snackBar = inject(MatSnackBar);
      const header = inject(HeaderService);



      super(httpClient, lginf, msg, model, activesub, snackBar, dialog, router, header)

     }

async ngOnInit(): Promise<void> {
    this._ngZone.run(async () => {
      const lgopostData = {};

      this.httpClient.post<any>(environment.apiroot + 'exit', lgopostData, await this.header.buildHttpOptions())
        .pipe(
          catchError(err => {
            const msg = err?.error?.error || '';
            const expected = err.status === 401 || err.status === 403 || msg.includes('Not logged in');

            if (!expected) {
              this.openDialog(strings.ErrConnect, msg);
            }
            // On retourne une valeur factice pour que subscribe().next() soit appelé quand même
            return of({ status: 'FORCED_LOGOUT' });
          })
        )
        .subscribe({
          next: (data:any) => {
            this.header.setToken(data.token);
            this.finishLogout();
          }
        });
    });
  }

  private finishLogout(): void {
    this.authService.signOut();
    this.lginf.logged = false;
    this.clearInit();
    this.lginf.clearLogin();

    const bid = this.lginf.getBouticId();
    localStorage.removeItem('lasturl_' + bid);
    localStorage.removeItem('lasttab_' + bid);

    this.router.navigate(['admin/main']);
  }

}
