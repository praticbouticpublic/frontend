import {HttpClient, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SessionfrontService } from '../../services/sessionfront.service';
import { environment } from 'src/environments/environment';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { Observable } from 'rxjs/internal/Observable';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { strings } from 'src/app/shared/string';
import { TypeMethod } from '../../enum/typemethod.enum';
import * as myGlobals from '../../../global';
import { DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-getinfo',
    templateUrl: './getinfo.component.html',
    styleUrls: ['./getinfo.component.scss'],
    imports: [ReactiveFormsModule, MatProgressSpinner, MatFormField, MatLabel, MatInput, MatError, MatRadioGroup, MatRadioButton, MatCheckbox, DecimalPipe]
})

export class GetinfoComponent {
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private order = inject(OrderService);
  private session = inject(SessionfrontService);
  private fb = inject(FormBuilder);
  public header = inject(HeaderService);

  nomclient = '';
  adrclient = '';
  bouticid = 0;
  aliasboutic = '';
  chm = '';
  cmemp = '';
  cmlivr = '';
  chp = '';
  cmpt = '';
  livr = '';
  verifcp = false;
  method = 0;
  inrange = 'ok';
  heightfortheBottom = '0px';
  sstotal = 0;
  showadrlivr = false;
  logo = '';
  srvroot = environment.srvroot;
  loadingState = true;
  frais:number | null = null;
  rem:number | null = null;
  nom = '';

  readonly header_ = viewChild.required<ElementRef>('header');
  readonly footer_ = viewChild.required<ElementRef>('footer');
  readonly fraislivr = viewChild.required<ElementRef>('fraislivr');
  readonly remise = viewChild.required<ElementRef>('remise');
  getinfoFormGroup!: FormGroup;

  getShowBarre() : boolean
  {
    return (sessionStorage.getItem('barre') !== 'fermer');
  }

  setShowBarre(etat: boolean)
  {
    sessionStorage.setItem('barre', etat ? 'fermer' : '');
  }

  ngOnInit() : void
  {
    this.aliasboutic = this.session.getAliasBoutic();
    this.bouticid = this.session.getBouticId();
    this.logo = this.session.getLogo();
    this.method = this.session.getMethod();
    this.sstotal = this.order.getSousTotal();
    this.nom = this.session.getNomBoutic();

    this.getinfoFormGroup = this.fb.group({
      clnom: [this.order.getNom(), [Validators.required, Validators.maxLength(60)]],
      clprenom: [this.order.getPrenom(), [Validators.required, Validators.maxLength(60)]],
      cltel: [this.order.getTelephone(), [Validators.required, Validators.pattern('(^(?:0|\\(?\\+33\\)?\\s?|0033\\s?)[0-9](?:[\\.\\-\\s]?\\d\\d){4}$)')]],
      vente: [this.order.getVente(), [Validators.required]],
      adrlivr: this.fb.group({
        ligne1: [this.order.getAdr1(), [Validators.required, Validators.maxLength(150)]],
        ligne2: [this.order.getAdr2(), [Validators.maxLength(150)]],
        codepostal: [this.order.getCodePostal(), [Validators.required, Validators.pattern('[0-9]{5}'), Validators.maxLength(5)]],
        ville: [this.order.getVille(), [Validators.required,Validators.maxLength(50)]]
      }),
      paiement: [this.order.getPaiement(), [Validators.required]],
      codepromo : [this.order.getCodePromo() ?? "", [Validators.pattern('[0-9A-Z]{8}')]],
      cgv: [false, [Validators.required]],
      infosup: [this.order.getInfoSup(), []]
    });


    this.getRemise();
    this.getClientInfo();
    if (this.method === TypeMethod.ATABLE)
    {
      this.getinfoFormGroup.get('clnom')?.disable();
      this.getinfoFormGroup.get('clprenom')?.disable();
      this.getinfoFormGroup.get('vente')?.disable();
      this.getinfoFormGroup.get('paiement')?.disable();
    }
    window.addEventListener('load', () => {
      this.setheightfortheBottom();
    })
    window.addEventListener('resize', () => {
      this.setheightfortheBottom();
    })
  }

  async getClientInfo() {
    const objbouticinf = { requete: "getClientInfo", customer: this.session.getAliasBoutic() };
    this.httpClient.post<string[]>(environment.apiroot + 'front', objbouticinf, await this.header.buildHttpOptions()).subscribe({
      next:async (data:string[]) => {
        this.nomclient = data[1];
        this.adrclient = data[2];
        await this.getParam('Choix_Method').then(obs0 => {
          obs0.subscribe({
            next:async (data:string) => {
              this.chm = (data[0] !== null) ? data[0] : 'TOUS';
              this.order.setVente(this.chm);
              this.getinfoFormGroup.get('vente')?.setValue(this.order.getVente());
              this.showadrlivr = (this.getinfoFormGroup.get('vente')?.value === "LIVRER");
              this.eraseAdrLivr(!this.showadrlivr);
              if (this.showadrlivr && (this.method !== TypeMethod.ATABLE))
                await this.getFraisLivraison();
              await this.getParam('CM_Emporter').then(obs1 => {
                obs1.subscribe({
                  next:async (data:string) => {
                    this.cmemp = (data[0] !== null) ? data[0] : 'Retrait Standard';
                    await this.getParam('CM_Livrer').then(obs2 => {
                      obs2.subscribe({
                        next:async (data:string) => {
                          this.cmlivr = (data[0] !== null) ? data[0] : 'Livraison Standard';
                          await this.getParam('Choix_Paiement').then(obs3 => {
                            obs3.subscribe({
                              next:async (data:string) => {
                                this.chp = (data[0] !== null) ? data[0] : 'TOUS';
                                this.order.setPaiement(this.chp);
                                this.getinfoFormGroup.get('paiement')?.setValue(this.order.getPaiement());
                                await this.getParam('MP_Comptant').then(obs4 => {
                                  obs4.subscribe({
                                    next:async (data:string) => {
                                      this.cmpt = (data[0] !== null) ? data[0] : 'Prochain écran par CB';
                                      await this.getParam('MP_Livraison').then(obs5 => {
                                        obs5.subscribe({
                                          next:async (data:string) => {
                                            this.livr = (data[0] !== null) ? data[0] : 'Paiement à la livraison';
                                            await this.getParam('VerifCP').then(obs6 => {
                                              obs6.subscribe({
                                                next:(data:string) => {
                                                  this.verifcp = !!+((data[0] !== null) ? data[0] : '0');
                                                  this.loadingState = false;
                                                  this.setheightfortheBottom();
                                                },
                                                error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                                              })
                                            })
                                          },
                                          error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                                        })
                                      })
                                    },
                                    error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                                  })
                                })
                              },
                              error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                            })
                          })
                        },
                        error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                      })
                    })
                  },
                  error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
                })
              })
            },
            error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
          })
        })

      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }

  async getParam(nomparam: string): Promise<Observable<string>> {
    const objmntcmdmini = { requete: "getparam", bouticid: this.session.getBouticId(), param: nomparam };
    return this.httpClient.post<string>(environment.apiroot + 'front', objmntcmdmini, await this.header.buildHttpOptions());
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  async checkcpfn(elem: any):Promise<Observable<string>>

  {
      let obj = { cp: elem, customer: this.session.getAliasBoutic() };
      return this.httpClient.post<string>(environment.apiroot + 'check-codepostal', obj, await this.header.buildHttpOptions());

  }


  setheightfortheBottom()
  {
    this.heightfortheBottom = ((window.innerHeight - this.footer_().nativeElement.clientHeight - this.header_().nativeElement.clientHeight) as number) + "px";
  }

  async getFraisLivraison()
  {
    let obj = { sstotal: this.sstotal, customer: this.session.getAliasBoutic() };
    this.httpClient.post<string>(environment.apiroot + 'frais-livr', obj, await this.header.buildHttpOptions()).subscribe({
      next:(response:any) => {
        if (+response.cost>0)
        {
          this.frais = +response.cost;
          this.order.setFraisLivr(+response.cost);
        }
        else
        {
          this.frais = null;
          this.order.setFraisLivr(0);
        }
      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }

  eraseAdrLivr(etat:boolean)
  {
    this.showadrlivr = !etat;
    etat ? this.getinfoFormGroup.get('adrlivr')?.disable() : this.getinfoFormGroup.get('adrlivr')?.enable();
    etat ? this.inrange = 'ok' : this.inrange = 'ko'
  }


   // Appel asynchrone pour connaitre le cout de la livraison
  removeFraisLivraison()
  {
    this.frais = 0;
    this.order.setFraisLivr(0);
  }

   // Appel asynchrone pour connaitre le montant de la remise
  async getRemise()
  {

    let obj = {
      sstotal: this.sstotal,
      customer: this.session.getAliasBoutic(),
      code: this.getinfoFormGroup.get('codepromo')?.value,
    };

    this.httpClient.post<string>(environment.apiroot + 'calcul-remise', obj, await this.header.buildHttpOptions()).subscribe({
      next:(response:any) => {
        if (+response.result>0)
        {
          this.rem = +response.result;
          this.order.setRemise(+response.result);
        }
        else
        {
          this.rem = null;
          this.order.setRemise(0);
        }
      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });

  }

  Retour()
  {
    this.bakInfo()
    this.router.navigate(['boutic/carte']);
  }

  onSubmit()
  {
    if (this.getinfoFormGroup.invalid) {
      return;
    }
    let elem = this.getinfoFormGroup.get(['adrlivr','codepostal'])?.value;
    if (this.verifcp)
    {
      if (elem.length === 5)
      {
        let obj = { cp: elem, customer: this.session.getAliasBoutic() };
        this.checkcpfn(elem).then(observable => {
          observable.subscribe({
            next: (response: any) => this.gotoPaiement(response.result),
            error: (err: any) => this.gotoPaiement('ko')
          });
        });

      }
    }
    else
    {
      this.gotoPaiement('ok');
    }

  }

  bakInfo()
  {
    this.order.setNom(this.getinfoFormGroup.get('clnom')?.value);
    this.order.setPrenom(this.getinfoFormGroup.get('clprenom')?.value);
    this.order.setTelephone(this.getinfoFormGroup.get('cltel')?.value);
    if (this.chm === 'TOUS')
      this.order.setVente(this.getinfoFormGroup.get('vente')?.value);
    this.order.setAdr1(this.getinfoFormGroup.get('adrlivr.ligne1')?.value);
    this.order.setAdr2(this.getinfoFormGroup.get('adrlivr.ligne2')?.value);
    this.order.setCodePostal(this.getinfoFormGroup.get('adrlivr.codepostal')?.value);
    this.order.setVille(this.getinfoFormGroup.get('adrlivr.ville')?.value);
    if (this.chp === 'TOUS')
      this.order.setPaiement(this.getinfoFormGroup.get('paiement')?.value);
    this.order.setCodePromo(this.getinfoFormGroup.get('codepromo')?.value);
    this.order.setInfoSup(this.getinfoFormGroup.get('infosup')?.value);
  }

  gotoPaiement(statuscp:any )
  {
    if ((statuscp === 'ko') && (this.verifcp))
    {
      this.openDialog(strings.CantContinue, strings.NotInZone +  ' : ' + this.adrclient);
      return;
    }

    if (this.getinfoFormGroup.get('cgv')?.value === true)
    {
      this.bakInfo();
      this.router.navigate(['boutic/paiement']);
    }
    else
      this.openDialog(strings.CantContinue, strings.RequireCGV);

  }

  ngAfterViewChecked()
  {
    setTimeout(() => {
      this.setheightfortheBottom();
    });
  }

  gotoCGV()
  {
    this.bakInfo();
    this.router.navigate(['admin/info/termsandconditions']);
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
