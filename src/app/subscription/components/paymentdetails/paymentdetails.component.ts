import { Component, EnvironmentInjector, NgZone, inject, runInInjectionContext, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { SubscriptionService } from 'src/app/shared/services/subscription.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Logininfo } from 'src/app/shared/models/logininfo';
import * as st from 'src/app/shared/enum/subscriptiontype.enum';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StripeCardElementOptions, StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { StripeCardComponent, StripePaymentElementComponent, StripeService, injectStripe } from 'ngx-stripe';
import * as myGlobals from '../../../global';
import { PushNotificationService } from 'src/app/shared/services/pushnotif.service';
import { SubscriptionBase } from '../../subscriptionbase';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCardActions } from '@angular/material/card';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {Initialisation} from "../../../back/initialisation";


@Component({
    selector: 'app-paymentdetails',
    templateUrl: './paymentdetails.component.html',
    styleUrls: ['./paymentdetails.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, StripeCardComponent, MatFormField, MatInput, MatCheckbox, MatCardActions, MatFabButton, MatIcon]
})

export class PaymentdetailsComponent extends SubscriptionBase {
  private route = inject(ActivatedRoute);
  private authentication = inject(AuthenticationService);
  private zone = inject(NgZone);
  private stripeService = inject(StripeService);
  private pushnotif = inject(PushNotificationService);


  loadingstate = true;
  linkparam: any;
  type: any;
  subscriptionId: any;
  clientSecret: any;
  loaded = false;
  menuenabled = false;
  formComponent! : any;
  alertController: any;
  isSubmitted = false;
  environment = environment;

  readonly paymentElement = viewChild.required(StripePaymentElementComponent);

  private readonly fb = inject(UntypedFormBuilder);

  elementsOptions: StripeElementsOptions = {
    mode: 'subscription',
    currency: 'eur',
    amount: 0,
    locale: 'fr',
    appearance: {
      theme: 'flat',
    },
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Montserrat:wght@400;500'
      }
    ]
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
    fields: {
      billingDetails: {
        address : {
          postalCode : 'never',
          country :'never'
        }
      }

    }
  };

  paymentElementForm = this.fb.group({
    nom: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.pattern(/d+/)]]
  });

  private environmentInjector = inject(EnvironmentInjector);

  readonly cardElement = viewChild.required(StripeCardComponent);

  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style : {
      base: {
        color: "#444444",
        backgroundColor: "#EEEEEE",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontWeight: "1",
        lineHeight: "2.5",
        fontSmoothing: "antialiased",
        fontSize: "14px",
        "::placeholder": {
          color: "#444444"
        }
      },
      invalid: {
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

  readonly card = viewChild.required(StripeCardComponent);

  stripe = injectStripe(environment.pkey);
  paying = signal(false);
  allowcgv!: boolean;

  constructor()
  {
    const lginfser = inject(LogininfoService);
    const sub = inject(SubscriptionService);

    super(lginfser, sub);
  }

  getLoaded()
  {
    return this.loaded;
  }

  setLoaded(myloaded: boolean)
  {
    this.loaded = myloaded;
  }

  ngOnInit()
  {
    this.route.params.subscribe(async (params: Params) => {
      this.type = params['type'];
      let action;

      if (this.type === 'init')
        action = "configuration";
      else if (this.type === 'back')
        action = "boconfiguration";

      const obj = { action, login: this.lginfser.getIdentifiant() };

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
              switch(environment.formulechoice)
              {
                case 1:
                  this.sub.setAboMode(st.SubscriptionType.COMMISSION);
                  if (price.lookupKey == "pb_conso")
                    this.conso(this.type, this.lginfser.getIdentifiant(), price.id);
                break;
                case 2:
                  this.sub.setAboMode(st.SubscriptionType.ENGAGEMENT);
                  if (price.lookupKey == "pb_fixe")
                    this.fixe(this.type, this.lginfser.getIdentifiant(), price.id);
                break;
                default:
                break;
              }
            });
          }
        },
        error:(err:any)=>
        {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      })

      this.loadingstate = false;
    });
  }

  gotoAdmin()
  {
    this.loadingstate = true;
    this.sub.clearAboMode();
    this.congratAlert();
    this.pushnotif.requestPermission();
  }

  openCongratDialog(title: string, body: string) {
    const dialogRef = this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
    dialogRef.afterClosed().subscribe(async (res) => {
      this.lginfser.getMotdepasse().then((motdepasse:string) => {
        this.authentication.processLogin(
          this.lginfser.getIdentifiant(), motdepasse).then(obs1 => {
            obs1.subscribe({
              next:(v: Logininfo) => {
                if (v.bouticid !== 0)
                {
                  this.zone.run(() => {
                    Initialisation.done = false;
                    Initialisation.nbnewcmd = 0;
                    this.router.navigate(['admin/backoffice/tabs/products/displaytable/article']);
                  });
                }
                else
                {
                  this.openDialog(strings.CantContinue, strings.MessageUnknownCredentials);
                  this.router.navigate(['admin/exit']);
                }
              }, error:(e: any) =>
              {
                this.openDialog(strings.ErrConnect, e.error.error);
              }
          });
        })
      });
    });
  }

  gotoAccountPage()
  {
    this.loaded = false;
    this.loadingstate = true;
    this.sub.clearAboMode();
    this.router.navigate(['admin/backoffice/subscriptions']);
  }

  presentcongratAlert()
  {
    this.congratAlert();
  }

  congratAlert()
  {
    this.openCongratDialog(strings.BouticMade, strings.Congrats);
  }

  buildboutic()
  {
    this.pushnotif._getDeviceToken().then(async token => {
      const obj = { device_id:token, device_type: 0 };
      this.httpClient.post(environment.apiroot + 'build-boutic', obj, await this.header.buildHttpOptions()).subscribe({
        next:(data:any) =>
        {
          this.gotoAdmin();
        },
        error:(err:any) =>
        {
          this.openDialog(strings.ErrConnect, err.error.error);
        }
      });
    });
  }

  displayError(event: any)
  {
    let displayError = document.getElementById('card-element-errors') as any;
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  }

  createPaymentMethod(stripe: any, cardElement: any, customerId: any, priceId: any)
  {
    const nameInput = this.paymentElementForm.get('nom')?.value;

    return stripe
      .createPaymentMethod({
        type: 'card',
        card: cardElement.element,
        //billing_details: { nameInput },
      }).subscribe((result: any) => {
        if (result.error) {
          this.displayError(result);
        } else {
          this.createSubscription(
            stripe,
            customerId,
            result.paymentMethod.id,
            priceId
          );
        }
      });
  }

  handlePaymentThatRequiresCustomerAction(
    stripe:any,
    subscription: any,
    invoice: any,
    priceId: any,
    paymentMethodId: any
  )
  {
    let setupIntent = subscription.pending_setup_intent;

    if (setupIntent && setupIntent.status === 'requires_action')
    {
      return stripe
        .confirmCardSetup(setupIntent.client_secret, {
          payment_method: paymentMethodId,
        })
        .then((result: any) => {
          if (result.error) {
            throw result;
          } else {
            if (result.setupIntent.status === 'succeeded') {
              return {
                priceId: priceId,
                subscription: subscription,
                invoice: invoice,
                paymentMethodId: paymentMethodId,
              };
            }
            else
              return;
          }
        });
    }
    else {
      return { subscription, priceId, paymentMethodId };
    }
  }

  async createSubscription(stripe: any, customerId:any, paymentMethodId: any, priceId: any)
  {
    let theaction;
    if (this.type == 'init')
      theaction = "consocreationabonnement";
    else if (this.type == 'back')
      theaction = "boconsocreationabonnement";
    const httpOptions = await this.header.buildHttpOptions();
    // Convertir HttpHeaders en objet plain pour fetch
    const headers: { [key: string]: string } = {};
    httpOptions.headers.keys().forEach(key => {
      headers[key] = httpOptions.headers.get(key) || '';
    });

    return (
    fetch(environment.apiroot + theaction, {
        method: 'post',
        headers,
        body: JSON.stringify({
          action: theaction,
          customerId: customerId,
          paymentMethodId: paymentMethodId,
          priceId: priceId
        }),
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        // If the card is declined, display an error to the user.
        .then((result) => {
          this.header.setToken(result.token);
          if (result.error) {
            // The card had an error when trying to attach it to a customer.
            // formComponent.remadelaststep();
            this.openDialog("Erreur", result.error);
            throw result;
          }
          this.isSubmitted = false;
          return result;
        })
        // Normalize the result to contain the object returned by Stripe.
        // Add the additional details we need.
        .then((result) => {
          if (this.type === 'init')
          {
            this.buildboutic();
          }
          else if (this.type === 'back')
          {
            this.gotoAccountPage();
          }
          return {
            paymentMethodId: paymentMethodId,
            priceId: priceId,
            subscription: result,
          };
        })
        // Some payment methods require a customer to be on session
        // to complete the payment process. Check the status of the
        // payment intent to handle these actions.
        //.then(handlePaymentThatRequiresCustomerAction)
        .then((result) => {
          this.handlePaymentThatRequiresCustomerAction(stripe, result, null, priceId, paymentMethodId);
          this.isSubmitted = false;
        })
        // If attaching this card to a Customer object succeeds,
        // but attempts to charge the customer fail, you
        // get a requires_payment_method error.
        //.then(handleRequiresPaymentMethod)
        // No more actions required. Provision your service for the user.
        //.then(onSubscriptionComplete)
        // No more actions required. Provision your service for the user.
        //.then(onSubscriptionComplete)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          this.displayError(error);
          this.isSubmitted = false;
        })
      );
  }

  pay()
  {
    const setMessage = (message:any) => {
      const messageDiv = document.querySelector('#messages') as HTMLElement;
      messageDiv.innerHTML = message;
    }
    if (this.paying()) return;
    if (!this.allowcgv) return;

    this.paying.set(false);
    let stripepubkey = environment.pkey;
    if (this.sub.getAboMode() === st.SubscriptionType.ENGAGEMENT)
    {
      if (!this.isSubmitted)
      {
        this.isSubmitted = true;
        const nameInput = this.paymentElementForm.get('nom')?.value;

        // Create payment method and confirm payment intent.
        this.stripeService.confirmCardPayment(this.sub.clientsecret, {
          payment_method: {
            card: this.cardElement().element,
            billing_details: {
              name: nameInput,
            },
          }
        }).subscribe((result: any) => {
          if(result.error) {
            setMessage(`Payment failed: ${result.error.message}`);
            this.isSubmitted = false;
          }
          else
          {
            if (this.type == 'init')
            {
              this.buildboutic();
            }
            else if (this.type == 'back')
            {
              this.gotoAccountPage();
            }
          }
        });
      }
    }
    else if (this.sub.abomode === st.SubscriptionType.COMMISSION)
    {
      if (!this.isSubmitted)
      {
        this.isSubmitted = true;
        this.createPaymentMethod( this.stripeService, this.card(), this.sub.customerid, this.sub.priceid);
      }
    }
    else
    {
      this.openDialog(strings.CantContinue, strings.NoActiveSubscription);
    }
  }

  allow()
  {
    this.allowcgv = !this.allowcgv;
  }

}




