import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
import { MatFormField, MatLabel, MatInput, MatSuffix, MatError } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatFabButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";


@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
    imports: [MatProgressSpinner, MatCard, MatCardContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatSuffix, MatError, MatRadioGroup, MatRadioButton, MatFabButton]
})
export class ClientComponent extends Initialisation {
  formBuilder = inject(FormBuilder);

  clientPropFormGroup!: FormGroup;
  bouticid = 0;
  isSubmitted = false;
  valeur: any[]= new Array();
  noaction: boolean = true;
  modified: boolean = false;
  params = ['pass','qualite','nom','prenom','adr1','adr2','cp','ville','tel'];
  fields = ['clpass','clqualite','clnom','clprenom','cladr1','cladr2','clcp','clville','cltel'];
  values = new Array();
  number = 0;
  loadingState = true;
  hide = true;
  hideconf = true;


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
    return this.clientPropFormGroup.controls;
  }

  async getStoredClientProp(prop: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'getClientProp', table:'', prop };
    return this.httpClient.post<string>(environment.apiroot + 'get-client-prop', obj, await this.header.buildHttpOptions());
  }

  async setStoredClientProp(prop: string, valeur: string): Promise<Observable<string>>
  {
    const obj = { bouticid: this.bouticid, action:'setClientProp', table:'', prop, valeur };
    return this.httpClient.post<string>(environment.apiroot + 'set-client-prop', obj, await this.header.buildHttpOptions());
  }

  ngOnInit()
  {
    super.chargementRessources();
  }

  override run()
  {
    this.bouticid = this.lginf.getBouticId();
    this.number = 0;
    this.getStoredData();
    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  getStoredData()
  {
    this.getStoredClientProp(this.params[this.number]).then(obs1 => {
      obs1.subscribe({
        next:(data:any) => {
          this.values[this.number] = data.value[0];
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
    let cantcontinue = false;
    if (this.fields[this.number] === "clpass")
    {
      if (this.clientPropFormGroup.get('clpass')?.value === '')
      {
        this.number++;
      }
      if (this.clientPropFormGroup.get('clpass')?.value !== this.clientPropFormGroup.get('clpassconf')?.value)
      {
        this.openDialog(strings.CantContinue, strings.PassordDiffer);
        cantcontinue = true;
      }
    }
    if (!cantcontinue)
    {
      this.setStoredClientProp(this.params[this.number], this.clientPropFormGroup.get(this.fields[this.number])?.value).then(obs1 => {
        obs1.subscribe({
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
  }

  buildForm()
  {
    this.clientPropFormGroup = this.formBuilder.group({
      clpass: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*?]).{8,}'), Validators.maxLength(255)]],
      clpassconf: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*?]).{8,}'), Validators.maxLength(255)]],
      clqualite : [this.values[1], [Validators.required]],
      clnom : [this.values[2], [Validators.required, Validators.maxLength(60)]],
      clprenom : [this.values[3], [Validators.required, Validators.maxLength(60)]],
      cladr1 : [this.values[4], [Validators.required, Validators.maxLength(150)]],
      cladr2 : [this.values[5], [Validators.maxLength(150)]],
      clcp : [this.values[6], [Validators.required, Validators.pattern('[0-9]{5}'), Validators.maxLength(5)]],
      clville : [this.values[7], [Validators.required, Validators.maxLength(50)]],
      cltel : [this.values[8], [Validators.required, Validators.pattern('(^(?:0|\\(?\\+33\\)?\\s?|0033\\s?)[0-9](?:[\\.\\-\\s]?\\d\\d){4}$)'), Validators.maxLength(150)]]
    });
  }

  onSubmit(): boolean
  {

    if (!this.clientPropFormGroup.valid)
    {
      this.isSubmitted = true;
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
      if (param !== 'pass')
        this.clientPropFormGroup.get(this.fields[idxparam])?.setValue(this.values[idxparam]);
      else
        this.clientPropFormGroup.get(this.fields[idxparam])?.setValue('');
    });
    this.clientPropFormGroup.get('clpassconf')?.setValue('');
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
