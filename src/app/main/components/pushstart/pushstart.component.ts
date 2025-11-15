import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { PushNotificationService } from 'src/app/shared/services/pushnotif.service';
import { environment } from 'src/environments/environment';
import { strings } from 'src/app/shared/string';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-pushstart',
    templateUrl: './pushstart.component.html',
    styleUrl: './pushstart.component.scss',
    imports: [MatProgressSpinner]
})
export class PushstartComponent {
  router = inject(Router);
  push = inject(PushNotificationService);
  lginf = inject(LogininfoService);
  private httpClient = inject(HttpClient);
  dialog = inject(MatDialog);
  public header = inject(HeaderService);


  ngOnInit()
  {
    let bouticid = this.lginf.getBouticId();
    let logged = this.lginf.getLogged(true);
    if (logged && (bouticid !== 0))
    {
      this.push._getDeviceToken().then(async token => {
        const obj = { bouticid, prop:'device_id' };
        this.httpClient.post<string>(environment.apiroot + 'set-custom-prop', obj, await this.header.buildHttpOptions()).subscribe({
          next:(data:any) => {
            if (data && data.result === token)
              this.router.navigate(['admin/backoffice/tabs/orders/displaytable/commande']);
            else
              window.open(window.location.protocol + '//' + window.location.host + '/admin', '_blank');
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
      this.router.navigate(['admin/main']);
    }
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

}
