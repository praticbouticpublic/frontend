import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { LogininfoService } from "../shared/services/logininfo.service";
import { MessageService } from "../shared/services/message.service";
import { ActiveSubscriptionService } from "../shared/services/activesubscription.service";
import { ModeleService } from "./services/model.service";
import { AlertstripeComponent } from "../shared/components/alertstripe/alertstripe.component";
import { DialogComponent } from "../shared/components/dialog/dialog.component";
import { strings } from "../shared/string";
import { Observable } from "rxjs";
import {HeaderService} from "../shared/services/header.service";

export class Initialisation {

  static done = false;
  lasturl ='';
  static nbnewcmd = 0;

  constructor(protected httpClient:HttpClient, protected lginf: LogininfoService, protected msg: MessageService,
    protected model:ModeleService, protected activesub:ActiveSubscriptionService, protected snackBar:MatSnackBar,
    protected dialog:MatDialog, protected router:Router, protected header:HeaderService) { }

  async lireParamNewCmd(): Promise<Observable<string>>
  {
    const obj = {
      bouticid: this.lginf.getBouticId(), action:'getparam', table:'', param:'NEW_ORDER',
    };
    return this.httpClient.post<string>(environment.apiroot + 'get-param', obj, await this.header.buildHttpOptions());
  }

  locRessources(dbd:any)
  {
    this.model.chargementDbd(dbd);
    this.msg.init();

    this.activesub.isActive().then(observable =>{
      observable.subscribe({
        next:(data:any) => {
          if (data.result === 'OK')
          {
            this.showAlertStripe();
          }
          else
          {
            this.router.navigate(['admin/backoffice/subscriptions']);
          }
        }, error:(err:any) => {
          return ;
        }
      });
    })


  }


  chargementRessources()
  {
    const URLmodel = 'assets/data/model.json';
    if (!Initialisation.done)
    {
      Initialisation.done = true;
      this.httpClient.get(URLmodel).subscribe(dbd => {
        this.locRessources(dbd);
        this.run();
      });
    }
    else
      this.run();
  }

  isInitDone()
  {
    return Initialisation.done;
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }


  async showAlertStripe()
  {

    const chargepostData = {
      bouticid: this.lginf.getBouticId()
    };

    this.httpClient.post(environment.apiroot + 'check-stripe-account', chargepostData,
      await this.header.buildHttpOptions()).subscribe({
        next:(response:any) => {
            if (response.result === 'KO')
            {
                this.openStripeAlertDialog();
            }
        },
        error:(err:any) => {
          this.openDialog(strings.ErrConnect, err.error.error);
        }
    });
  }

  openStripeAlertDialog(): void {
    const dialogRef = this.dialog.open(AlertstripeComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'yes') {
        this.router.navigate(['admin/backoffice/money']);
      }
    });
  }

  protected run(): void {};

  clearInit()
  {
    clearInterval(this.lginf.getHandleId());
    this.lginf.setHandleId(undefined);
    Initialisation.done = false;
  }

}



