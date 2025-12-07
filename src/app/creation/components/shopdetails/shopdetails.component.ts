import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { environment } from 'src/environments/environment';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { strings } from 'src/app/shared/string';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { CreationbouticService } from '../../../shared/services/creationboutic.service';
import '../../../shared/string.extensions';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatInput, MatError } from '@angular/material/input';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-shopdetails',
    templateUrl: './shopdetails.component.html',
    styleUrls: ['./shopdetails.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatInput, MatError, MatButton, MatCheckbox, MatCardActions, MatFabButton, MatIcon]
})
export class ShopdetailsComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);
  private creabou = inject(CreationbouticService);
  private header = inject(HeaderService);


  shopdetailsFormGroup!: FormGroup<any>;
  loadingstate = true;
  logoloaded = true;
  srclogo = '';
  srvroot = environment.srvroot;
  isSubmitted = false;


  ngOnInit()
  {
    this.shopdetailsFormGroup = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      aliasboutic: ['', [Validators.required, Validators.pattern('[a-z0-9]{3,}'), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'), Validators.maxLength(255)]]
    });
    this.loadingstate = false;
  }

  expurger(str: any): any
  {
    let ret = '';
    const charok = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (const s of str)
    {
      for (const ch of charok)
      {
        if (s === ch)
        {
          ret =  ret + s;
        }
      }
    }
    return ret;
  }

  createAlias($event: KeyboardEvent)
  {
    this.shopdetailsFormGroup.get('aliasboutic')?.setValue(this.expurger((this.shopdetailsFormGroup.value.nom).toLowerCase().sansAccent()));
  }

  async uploadlogo(elem: any)
  {
    const fileInput = elem.target;
    const formData = new FormData();
    formData.append('file', ((fileInput as HTMLInputElement).files as FileList)[0]);
    this.logoloaded = false;

    this.httpClient.post<any>(environment.apiroot + 'upload', formData, await this.header.buildHttpOptions(true)).subscribe({
      next:(data:any) => {
        this.header.setToken(data.token);
        this.srclogo = data.result;
        this.logoloaded = true;
      },
      error:(err:any) => {
        this.openDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  async onSubmitShopdetails() {
    if (!this.shopdetailsFormGroup.valid)
    {
      return;
    }
    this.isSubmitted = true;
    this.loadingstate = true;
    this.creabou.setBoutic(this.shopdetailsFormGroup.value.nom, this.shopdetailsFormGroup.value.aliasboutic,
                           this.shopdetailsFormGroup.value.email, this.srclogo);
    let obj = {
      aliasboutic: this.shopdetailsFormGroup.value.aliasboutic,
      nom: this.shopdetailsFormGroup.value.nom,
      logo: this.srclogo,
      email: this.shopdetailsFormGroup.value.email
    };
    this.httpClient.post<any>(environment.apiroot + 'register-boutic', obj, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.header.setToken(data.token);
        if (data.result === "OK")
        {
          this.router.navigate(['admin/creation/shopsettings']);
        }
        this.loadingstate = false;
      },
      error:(err:any) => {
        this.loadingstate = false;
        this.openErrDialog(strings.ErrConnect, err.error.error);
        this.isSubmitted = false;
      }

    });

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

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }


  closeimg(elem:any)
  {
    this.srclogo ='';
    (elem as HTMLImageElement)
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
}
