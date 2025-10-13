import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {observable, Observable} from 'rxjs';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { Initialisation } from '../../initialisation';
import { MessageService } from 'src/app/shared/services/message.service';
import { ModeleService } from '../../services/model.service';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    imports: [MatProgressSpinner, MatCard, MatCardContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatCheckbox, MatSelect, MatOption, MatError, MatFabButton, MatIcon]
})
export class SettingsComponent extends Initialisation {
  formBuilder = inject(FormBuilder);


  settingsFormGroup!: FormGroup;
  bouticid = 0;
  isSubmitted = false;
  valeur: any[]= new Array();
  noaction: boolean = true;
  modified: boolean = false;
  params = ['Subject_mail','VALIDATION_SMS','VerifCP','Choix_Paiement','MP_Comptant','MP_Livraison','Choix_Method','CM_Livrer',
    'CM_Emporter','MntCmdMini','SIZE_IMG','MONEY_SYSTEM'];
  fields = ['subjectmail','validationsms', 'verifcp', 'choixpaiement', 'mpcomptant', 'mplivraison', 'choixmethod', 'cmlivrer',
    'cmemporter', 'mntmincmd', 'sizeimg', 'moneysystem'];
  type = ['text','bool','bool','select','text','text','select','text',
    'text','prix','select','select']
  values = new Array();
  number = 0;
  loadingState = true;


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

  flagAsModified()
  {
    this.modified = true;
  }

  get errorControl()
  {
    return this.settingsFormGroup.controls;
  }

  async getStoredParam(param: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'getparam', table:'', param };
    return this.httpClient.post<string>(environment.apiroot + 'get-param', obj, await this.header.buildHttpOptions());
  }

  async setStoredParam(param: string, valeur: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'setparam', table:'', param, valeur };
    return this.httpClient.post<string>(environment.apiroot + 'set-param', obj, await this.header.buildHttpOptions());
  }

  ngOnInit()
  {

    this.bouticid = this.lginf.getBouticId();
    this.number = 0;
    this.getStoredData();
    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  getStoredData()
  {
    this.getStoredParam(this.params[this.number]).then(observable => {
      observable.subscribe({
        next:(data:any) => {
          this.values[this.number] = (this.type[this.number] !== 'bool') ?  data.value : (data.value ==='1');
          this.number++;
          if (this.number < this.params.length)
            this.getStoredData();
          else
          {
            this.buildForm();
            this.loadingState = false;
          }
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    })

  }

  setStoredData()
  {
    let valeur = this.settingsFormGroup.get(this.fields[this.number])?.value;
    this.setStoredParam(this.params[this.number], (this.type[this.number] !== 'bool') ? valeur : (valeur ? '1': '0'))
      .then(observable => {
      observable.subscribe({
        next:(data:string) => {
          this.number++;
          if (this.number < this.params.length)
            this.setStoredData();
          else
            this.modified = false;
        },
        error:(err:any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    })

  }

  buildForm()
  {
    this.settingsFormGroup = this.formBuilder.group({
      subjectmail: [this.values[0], []],
      validationsms: [this.values[1], [Validators.required]],
      verifcp: [this.values[2], [Validators.required]],
      choixpaiement: [this.values[3], [Validators.required]],
      mpcomptant: [this.values[4], []],
      mplivraison: [this.values[5], []],
      choixmethod: [this.values[6], [Validators.required]],
      cmlivrer: [this.values[7], []],
      cmemporter: [this.values[8], []],
      mntmincmd: [this.values[9], [Validators.required, Validators.min(0)]],
      sizeimg: [this.values[10], [Validators.required]],
      moneysystem: [this.values[11], [Validators.required]]
    });
  }

  onSubmit():boolean
  {
    this.isSubmitted = true;
    if (!this.settingsFormGroup.valid)
    {
      return false;
    }
    else
    {
      this.number = 0;
      this.setStoredData();
      return true;
    }
  }

  cancelUpdates()
  {
    this.params.forEach((param, idxparam) => {
      this.settingsFormGroup.get(this.fields[idxparam])?.setValue(this.values[idxparam]);
    })
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
