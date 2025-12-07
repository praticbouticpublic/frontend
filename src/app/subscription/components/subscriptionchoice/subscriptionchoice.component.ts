import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { CreationbouticService } from '../../../shared/services/creationboutic.service';
import { SubscriptionService } from 'src/app/shared/services/subscription.service';
import * as st from 'src/app/shared/enum/subscriptiontype.enum';
import { SubscriptionBase } from '../../subscriptionbase';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCardActions } from '@angular/material/card';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export interface Prices {
  prices: any
}
export interface Abonnement {
  subscriptionId: any;
  clientSecret: any;
}
export interface Conso {
  customerId: any;
  priceId: any;
}

@Component({
    selector: 'app-subscriptionchoice',
    templateUrl: './subscriptionchoice.component.html',
    styleUrls: ['./subscriptionchoice.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatCheckbox, MatCardActions, MatFabButton, MatIcon]
})

export class SubscriptionchoiceComponent extends SubscriptionBase
{
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  loadingstate = true;
  subchoiceForm!: FormGroup<any>;
  subscription: st.SubscriptionType = 0;
  loaded = false;
  isSubmitted = false;
  type = '';
  allowcgv = false;

  constructor()
  {
    const lginfser = inject(LogininfoService);
    const sub = inject(SubscriptionService);
    super(lginfser, sub);
  }

  ngOnInit()
  {
    this.route.params.subscribe((params: Params) => {
      this.type = params['type'];
      this.subchoiceForm = this.formBuilder.group({
        abonnement: ['', [Validators.required]],
        cgv: [false, [Validators.required]]
      });
      this.loadingstate = false;
      this.changelink(this.type);
    });
  }

  onSubmitSubChoice()
  {
    this.loaded = false;
    this.isSubmitted = true;
    if (!this.subchoiceForm.valid)
    {
      this.loaded = true;
      this.isSubmitted = false;
      return ;
    }
    else
    {
      if (this.subchoiceForm.value.cgv === true)
      {
        this.router.navigate(['admin/subscription/paymentdetails/' + this.type]);
      }
      this.isSubmitted = false;
      this.loaded = true;
    }
  }

  toggle(elem: any)
  {
    if (elem === 'commission')
    {
      if (this.subscription !== st.SubscriptionType.COMMISSION)
      {
        this.subscription = st.SubscriptionType.COMMISSION;
      }
      else if (this.subscription === st.SubscriptionType.COMMISSION)
      {
        this.subscription = st.SubscriptionType.AUCUN;
      }
    }
    else if (elem === 'engagement')
    {
      if (this.subscription !== st.SubscriptionType.ENGAGEMENT)
      {
        this.subscription = st.SubscriptionType.ENGAGEMENT;
      }
      else if (this.subscription === st.SubscriptionType.ENGAGEMENT)
      {
        this.subscription = st.SubscriptionType.AUCUN;
      }
    }
    this.sub.setAboMode(this.subscription);
  }

  async changelink(type: any)
  {
    let action: any;

    if (type === 'init')
      action = "configuration";
    else if (type === 'back')
      action = "boconfiguration";

    const obj = { action: action, login: this.lginfser.getIdentifiant() };

    this.httpClient.post<any>(environment.apiroot + action, obj, await this.header.buildHttpOptions()).subscribe({
        next:(data:any) =>
      {
        if(!data.prices)
        {
          this.openDialog(strings.CantContinue, strings.NoPrice);
          this.pasdetarif();
        }
        else
        {
          data.prices.forEach((price:any) => {
            if (price.lookup_key == "pb_fixe")
              this.fixe(type, this.lginfser.getIdentifiant(), price.id);
            else if (price.lookup_key == "pb_conso")
              this.conso(type, this.lginfser.getIdentifiant(), price.id);
          });
        }
      },
      error:(err:any)=>
      {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  allow()
  {
    this.allowcgv = !this.allowcgv;
    this.subchoiceForm.setValue({abonnement: this.subscription, cgv: this.allowcgv});
  }

}


