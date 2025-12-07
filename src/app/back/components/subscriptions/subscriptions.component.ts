import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { DialogContentSuppression, DialogContentSuppressionBis } from '../backoffice/backoffice.component';

import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatLabel } from '@angular/material/input';
import {HeaderService} from "../../../shared/services/header.service";


@Component({
    selector: 'app-subscriptions',
    templateUrl: './subscriptions.component.html',
    styleUrls: ['./subscriptions.component.scss'],
    imports: [MatProgressSpinner, MatFabButton, MatIcon, MatList, MatDivider, MatLabel]
})

export class SubscriptionsComponent {
  private httpClient = inject(HttpClient);
  dialog = inject(MatDialog);
  router = inject(Router);
  lginf = inject(LogininfoService);
  header = inject(HeaderService);



  subs: any;
  suboject: any;
  subscriptions: any;
  loaded = false;
  menuenabled = false;
  loadingstate = true;

  async ngOnInit(): Promise<void> {

    const postData = {
      action: 'lienscreationboutic',
      login: this.lginf.getIdentifiant()
    };

    this.httpClient.post<any>(environment.apiroot + 'liens-creation-boutic', postData, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.subs = data.data;
        this.subscriptions = new Array();
          for(const sub of this.subs)
          {
            let st =  JSON.parse(sub.stripe_subscription);
            const subscription = {
              subid : st.id,
              aboref : sub.aboid.toString().padStart(10, '0'),
              usagetype : st.items.data[0].price.recurring.usage_type,
              decimalprice : st.items.data[0].price.unit_amount_decimal,
              currency : st.items.data[0].price.metadata.currency_symbol,
              interval : st.items.data[0].price.metadata.fr_interval,
              status : st.status,
              undercancel : st.cancel_at_period_end
            };
            if (subscription.status === 'active')
            {
              this.menuenabled = true;
            }
            this.subscriptions.push(subscription);
          }
          this.loadingstate = false;
        },
        error:(err:any) => {
          this.openDialog(strings.ErrConnect, err.error.error);
          this.router.navigate(['admin/exit']);
        }
      });
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  onCancel(elem: any)
  {
    this.openCancelSubscriptionConfirmationDialog(elem);
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  openCancelSubscriptionConfirmationDialog(elem:any): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.AskCancelSubscription }
    });

    dialogRef.afterClosed().subscribe(async (result: string) => {
      if (result === 'yes') {
        const postDataCancel = {
          action : 'boannulerabonnement',
          subscriptionid : elem.subid,
          login: this.lginf.getIdentifiant()
        };
        this.httpClient.post<any>(environment.apiroot + 'boannulerabonnement', postDataCancel, await this.header.buildHttpOptions()).subscribe({
            next:(data:any) => {
              this.ngOnInit().then(()=>{});
            },
            error:(err:any) => {
              this.openErrDialog(strings.ErrConnect, err.error.error);
            }
        });
      }
    });
  }

  goToAddSubcription()
  {
    if (environment.formulechoice === 3)
      this.router.navigate(['admin/subscription/subscriptionchoice/back']);
    else
      this.router.navigate(['admin/subscription/paymentdetails/back']);
  }

  gotoLoginPage()
  {
    localStorage.setItem('lasttab_' + this.lginf.getBouticId(), 'admin/backoffice/tabs/products/displaytable/article');
    if (this.menuenabled)
      this.router.navigate(['admin/backoffice/tabs/products/displaytable/article']);
    else
      this.router.navigate(['admin/exit']);
  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate(['admin/main/exit'])
    });
  }

    exit()
    {
      this.router.navigate(['admin/main']);
    }

    async deleteboutic()
    {

      const obj = { bouticid: this.lginf.getBouticId(), email: this.lginf.getIdentifiant()};
      this.httpClient.post<any>(environment.apiroot + 'suppression', obj, await this.header.buildHttpOptions()).subscribe({
        next:(data:any) =>
        {
          this.exit();
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    }

    suppression()
    {
      const dialogRef = this.dialog.open(DialogContentSuppression);

      dialogRef.afterClosed().subscribe(result => {
        if (result === true)
        {
          const dialogRef2 = this.dialog.open(DialogContentSuppressionBis);

          dialogRef2.afterClosed().subscribe(async result2 => {
            if (result2 === true)
            {
              await this.deleteboutic();
            }
          });
        }
      });
    }


}
