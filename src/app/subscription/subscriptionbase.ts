import { environment } from "src/environments/environment";
import { strings } from "../shared/string";
import { HttpClient } from "@angular/common/http";
import { LogininfoService } from "../shared/services/logininfo.service";
import * as myGlobals from './../global';
import { SubscriptionService } from "../shared/services/subscription.service";
import { DialogComponent } from "../shared/components/dialog/dialog.component";
import { Dialog } from "@angular/cdk/dialog";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ConfirmationComponent } from "../shared/components/confirmation/confirmation.component";
import {Initialisation} from "../back/initialisation";
import {inject} from "@angular/core";
import {MessageService} from "../shared/services/message.service";
import {ModeleService} from "../back/services/model.service";
import {ActiveSubscriptionService} from "../shared/services/activesubscription.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HeaderService} from "../shared/services/header.service";

export class SubscriptionBase extends Initialisation
{
  loadingfixe = false;
  loadingconso = false;


  constructor(public lginfser: LogininfoService, public sub: SubscriptionService)
  {
    const httpClient = inject(HttpClient);
    const msg = inject(MessageService);
    const dialog = inject(MatDialog);
    const router = inject(Router);
    const model = inject(ModeleService);
    const activesub = inject(ActiveSubscriptionService);
    const snackBar = inject(MatSnackBar);
    const header = inject(HeaderService);
    super(httpClient, lginfser, msg, model, activesub, snackBar, dialog, router, header);

  }

  async fixe(type: any, login: any, priceId: any)
  {
    let action: any;
    if (type === 'init')
      action = "creationabonnement";
    else if (type === 'back')
      action = "bocreationabonnement";
    const obj = { action: action, login: this.lginfser.getIdentifiant(), priceid:priceId };
    this.httpClient.post<any>(environment.apiroot + action, obj, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.header.setToken(data.token);
        this.sub.setAbonementFixeParam(data.subscriptionId, data.clientSecret);
        this.loadingfixe = false;
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async conso(type: any, login: any, priceId: any)
  {
    let action: any;

    if (type === 'init')
      action = "conso";
    else if (type === 'back')
      action = "boconso";

    const obj = { action: action, login: login, priceid:priceId };
    this.httpClient.post<any>(environment.apiroot + action, obj, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) =>
      {
        this.header.setToken(data.token);
        this.sub.setAbonementConsoParam(data.customerId, data.priceId);
        this.loadingconso = false;
      },
      error:(err:any) =>
      {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    })
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate(['admin/main'])
    });
  }

  pasdetarif()
  {
    this.router.navigate(['admin/main']);
  }

  gotoCGV(type:any)
  {
    this.router.navigate(['admin/info/termsandconditions/' + type]);
  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'yes') {
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

}
