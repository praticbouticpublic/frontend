import { Platform } from '@angular/cdk/platform';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { Initialisation } from '../../initialisation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'src/app/shared/services/message.service';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { ModeleService } from '../../services/model.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
    imports: [MatProgressSpinner, MatCard, MatCardContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, MatFabButton, MatIcon]
})
export class ShopComponent extends Initialisation {
  formBuilder = inject(FormBuilder);


  shopFormGroup!: FormGroup;
  isSubmitted = false;
  alias = '';
  nom = '';
  email ='';
  pbnom: any = '';
  pbadr1: any = '';
  pbadr2:  any = '';
  pbcp: any = '';
  pbville: any = '';
  logo: any= '';
  pbemail: any= '';
  images: any[]=[];
  bouticid = 0;
  valeur: any[]= new Array();
  noaction: boolean = true;
  srvroot = environment.srvroot;
  webhost = window.location.protocol + '//' + window.location.host + '/';
  modified = false;
  loadingState = true;
  logoLoading: any;
  bouticalreadytaken = false;

  flagAsModified()
  {
    this.modified = true;
  }

  constructor()
  {
    const httpClient = inject(HttpClient);
    const lginf = inject(LogininfoService);
    const msg = inject(MessageService);
    const model = inject(ModeleService);
    const activesub = inject(ActiveSubscriptionService);
    const snackbar = inject(MatSnackBar);
    const router = inject(Router);
    const dialog = inject(MatDialog);
    const header = inject(HeaderService);

    super(httpClient, lginf, msg, model, activesub, snackbar, dialog, router, header);
  }

  get errorControl()
  {
    return this.shopFormGroup.controls;
  }

  async getStoredCustomProp(prop: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'getCustomProp', table:'', prop };
    return this.httpClient.post<string>(environment.apiroot + 'get-custom-prop', obj, await this.header.buildHttpOptions());
  }

  async setStoredCustomProp(prop: string, valeur: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'setCustomProp', table:'', prop, valeur };
    return this.httpClient.post<string>(environment.apiroot + 'set-custom-prop', obj, await this.header.buildHttpOptions());
  }

  ngOnInit()
  {
    super.chargementRessources();
  }

  override run()
  {
    this.bouticid = this.lginf.getBouticId();
    this.getStoredData();
    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  getStoredData()
  {
    this.getStoredCustomProp('customer').then(obs1 => {
      obs1.subscribe({
        next:(data:any) => {
          this.alias = data.value[0];
          this.getStoredCustomProp('nom').then(obs2 => {
            obs2.subscribe({
              next:(data:any) => {
                this.nom = data.value[0];
                this.getStoredCustomProp('logo').then(obs3 => {
                  obs3.subscribe({
                    next:(data:any) => {
                      this.logo = data.value[0];
                      this.getStoredCustomProp('courriel').then(obs4 => {
                        obs4.subscribe({
                          next:(data:any) => {
                            this.email =data.value[0];
                            this.buildForm();
                            this.loadingState = false;
                          },
                          error:(err:any) => {
                            this.openErrDialog(strings.ErrConnect, err.error.error);
                          }
                        });
                      })
                    },
                    error:(err:any) => {
                      this.openErrDialog(strings.ErrConnect, err.error.error);
                    }
                  });
                })
              },
              error:(err:any) => {
                this.openErrDialog(strings.ErrConnect, err.error.error);
              }
            });
          })
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    })

  }

  setStoredData()
  {
    this.setStoredCustomProp('customer', this.shopFormGroup.get('pbalias')?.value).then(obs1 => {
      obs1.subscribe({
        next:(data:any) => {
          if (data.result === 'OK')
          {
            this.bouticalreadytaken = false;
            this.setStoredCustomProp('nom', this.shopFormGroup.get('pbnom')?.value).then(obs2 => {
              obs2.subscribe({
                next:(data:any) => {
                  if (data.result === 'OK')
                  {
                    this.setStoredCustomProp('logo', this.shopFormGroup.get('pblogo')?.value).then(obs3 => {
                      obs2.subscribe({
                        next:(data:any) => {
                          if (data.result === 'OK')
                          {
                            this.setStoredCustomProp('courriel', this.shopFormGroup.get('pbemail')?.value).then(obs4 => {
                              obs4.subscribe({
                                next:(data:any) => {
                                  if (data.result === 'OK')
                                  {
                                    this.modified = false;
                                  }
                                },
                                error:(err:any) => {
                                  this.openErrDialog(strings.ErrConnect, err.error.error);
                                }
                              });
                            })
                          }
                        },
                        error:(err:any) => {
                          this.openErrDialog(strings.ErrConnect, err.error.error);
                        }
                      });
                    })
                  }
                },
                error:(err:any) => {
                  this.openErrDialog(strings.ErrConnect, err.error.error);
                }
              });
            })
          }
          else
          {
            if (data === "KO")
            {
              this.openDialog(strings.Error, strings.BouticAlreadytaken);
            }
          }
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    })
  }

  buildForm()
  {
    this.shopFormGroup = this.formBuilder.group({
      pbalias: [this.alias, [Validators.required, Validators.pattern('[a-z0-9]{3,}')]],
      pbnom: [this.nom, [Validators.required]],
      pblogo: [this.logo, []],
      pbemail: [this.email, [Validators.required, Validators.email]]
    });
  }

  onSubmit() :boolean
  {
    this.isSubmitted = true;
    if (!this.shopFormGroup.valid)
    {
      return false;
    }
    else
    {
      this.setStoredData();
      return true;
    }
  }

  uploadlogo(elem: HTMLInputElement)
  {
    const formdata = new FormData();
    formdata.append('file[]', (elem.files as FileList)[0]);
    this.logoLoading = true;
    this.httpClient.post<any>(environment.apiroot + 'boupload', formdata, {  withCredentials:true })
    .subscribe({
      next:(data:any) => {
        this.shopFormGroup.get('pblogo')?.setValue(data[0]);
        this.logoLoading = false;
      },
      error:(err:any) => {
        this.logoLoading = false;
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  closeimg()
  {
    this.shopFormGroup.get('pblogo')?.setValue('');
  }

  onFileChoose(elem: any)
  {
    this.uploadlogo(elem.target as HTMLInputElement);
  }

  bak(ref: any, elem: any)
  {
    localStorage.setItem(ref, elem);
  }

  gotoUpperPage()
  {
    this.router.navigate(['admin/main']);
  }

  cancelUpdates()
  {
    this.shopFormGroup.get('pbalias')?.setValue(this.alias);
    this.shopFormGroup.get('pbnom')?.setValue(this.nom);
    this.shopFormGroup.get('pblogo')?.setValue(this.logo);
    this.shopFormGroup.get('pbemail')?.setValue(this.email);
    this.modified = false;
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

}
