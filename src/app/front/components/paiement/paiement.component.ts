import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, EnvironmentInjector, inject, runInInjectionContext, signal, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrderService, Orderline } from '../../services/order.service';
import { SessionfrontService } from '../../services/sessionfront.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { TypeMethod } from '../../enum/typemethod.enum';
import { strings } from 'src/app/shared/string';


import {
  injectStripe,
  StripeElementsDirective,
  StripePaymentElementComponent
} from 'ngx-stripe';
import {
  StripeElementsOptions,
  StripePaymentElementOptions
} from '@stripe/stripe-js';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import * as myGlobals from './../../../global'
import { DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-paiement',
    templateUrl: './paiement.component.html',
    styleUrls: ['./paiement.component.scss'],
    imports: [MatProgressSpinner, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, StripeElementsDirective, StripePaymentElementComponent, MatButton, DecimalPipe]
})

export class PaiementComponent
{
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private order = inject(OrderService);
  private session = inject(SessionfrontService);
  private header  = inject(HeaderService);

  vente ='';
  paiement ='';
  remise = 0;
  fraislivr = 0;
  method = 0;
  mnysys = 'STRIPE MARKETPLACE';
  loadingState = true;
  srvroot = environment.srvroot;
  logo ='';
  table = 0;
  somme = 0;
  nom = '';

  readonly header_ = viewChild.required<ElementRef>('header');
  readonly paiementfooter = viewChild.required<ElementRef>('paiementfooter');
  readonly footer = viewChild.required<ElementRef>('footer');
  heightfortheBottom = '0px';
  commande: Orderline[] = new Array;
  displayedColumns: string[] = ['nom', 'prix', 'quantite', 'total'];
  complete = false;
  stripe:any;
  paying:any;

  readonly paymentElement = viewChild.required(StripePaymentElementComponent);

  private readonly fb = inject(UntypedFormBuilder);

  elementsOptions: StripeElementsOptions = {
    locale: 'fr',
    appearance: {
      theme: 'flat',
    },
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
    fields: {
      billingDetails: {
        address : {
          country :'never'
        }
      }

    }
  };

  private environmentInjector = inject(EnvironmentInjector);

  getShowBarre() : boolean
  {
    return (sessionStorage.getItem('barre') !== 'fermer');
  }

  setShowBarre(etat: boolean)
  {
    sessionStorage.setItem('barre', etat ? 'fermer' : '');
  }

  ngOnInit()
  {
    this.logo = this.session.getLogo();
    this.paiement = this.order.getPaiement();
    this.vente = this.order.getVente();
    this.commande = this.order.getCommande();
    this.table = this.session.getTable();
    this.somme = this.order.getSousTotal();
    this.remise = this.order.getRemise();
    this.method = this.session.getMethod();
    this.fraislivr = this.order.getFraisLivr();
    this.nom = this.session.getNomBoutic();
    this.getParam('MONEY_SYSTEM').then(abo0 => {
      abo0.subscribe({
        next:(data:string) => {
          this.mnysys = ((data[0] !== null) ? data[0] : 'STRIPE MARKETPLACE');
          this.loadingState = false;
          if ((this.session.getMethod() === TypeMethod.CLICKNCOLLECT) && (this.order.getPaiement()==="COMPTANT"))
          {
            let pkey = environment.pkey;
            this.getParam('STRIPE_ACCOUNT_ID').then(abo1 => {
              abo1.subscribe({
                next:(data:string) => {
                  let caid = ((data[0] !== null) ? data[0] : '');
                  runInInjectionContext(this.environmentInjector, async () => {
                    this.stripe = injectStripe(pkey, { stripeAccount: caid });
                    this.paying = signal(false);
                    if (!this.stripe)
                      this.router.navigate(['boutic/error']);
                    // The items the customer wants to buy
                    var purchase = {
                      items: this.commande,
                      boutic: this.session.getAliasBoutic(),
                      model: this.order.getVente(),
                      fraislivr: this.order.getFraisLivr(),
                      codepromo: this.order.getCodePromo()
                    };
                    this.httpClient.post<any>(environment.apiroot + 'create', purchase, await this.header.buildHttpOptions()).subscribe({
                      next:(pi:any) =>
                      {
                        this.header.setToken(pi.token);
                        this.elementsOptions.clientSecret = pi.intent;
                      },
                      error:(err:any) => this.openDialog(strings.ErrConnect, err.error.error)
                    });
                  });
                }
              });
            })
          }
        },
        error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
      })
    })

  }

  pay()
  {
    if (this.paying()) return;
    this.paying.set(true);

    this.stripe.confirmPayment({
      elements: this.paymentElement().elements,
      confirmParams: {
        //return_url: window.location.origin + '/boutic/fin',
        payment_method_data : {
          billing_details : {
            address : {
              country : 'FR'
            },
          },
        },
      },
      redirect: 'if_required'
    })
    .subscribe((result: any) => {
      this.paying.set(false);
      //console.log('Résultat', result);
      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        this.openDialog('Echec', result.error.message );
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === 'succeeded') {
          // Show a success message to your customer
          //this.openDialog('Réussite', '');
          this.router.navigate(['boutic/fin']);
        }
      }
    });
  }


  async getParam(nomparam: string): Promise<Observable<string>> {
    const objmntcmdmini = { requete: "getparam", bouticid: this.session.getBouticId(), param: nomparam };
    return this.httpClient.post<string>(environment.apiroot + 'front', objmntcmdmini, await this.header.buildHttpOptions());
  }

  setheightfortheBottom()
  {
    var x;
    if (this.session.getMethod() != null)
    {
      if ((this.session.getMethod() === TypeMethod.CLICKNCOLLECT) && (this.order.getPaiement() === "COMPTANT"))
        x = window.innerHeight - this.paiementfooter().nativeElement.clientHeight - this.header_().nativeElement.clientHeight;
      else
        x = window.innerHeight - this.footer().nativeElement.clientHeight - this.header_().nativeElement.clientHeight;
      this.heightfortheBottom = x + "px";
    }
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  ngAfterViewChecked()
  {
    setTimeout(() => {
      this.setheightfortheBottom();
    }, 100);
  }

  Retour()
  {
    this.router.navigate(['boutic/getinfo']);
  }

  gotoFin()
  {
    this.router.navigate(['boutic/fin'])
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate([this.session.getAliasBoutic(true) + '/' + this.session.getMethod(true) + '/' + this.session.getTable(true)])
    });
  }

}
