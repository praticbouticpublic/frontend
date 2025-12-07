import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { environment } from 'src/environments/environment';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';

import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'app-qrcodegenerator',
    templateUrl: './qrcodegenerator.component.html',
    styleUrls: ['./qrcodegenerator.component.scss'],
    imports: [MatCard, MatCardContent, ReactiveFormsModule, MatRadioGroup, MatRadioButton, MatFormField, MatLabel, MatInput, MatButton]
})
export class QrcodegeneratorComponent {
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  private lginf = inject(LogininfoService);
  isSubmitted: any;
  qrcodegenForm!: FormGroup;

  ngOnInit()
  {
    this.qrcodegenForm = this.formBuilder.group({
      methv: ['3', [Validators.required]],
      nbtable:  ['1', ],
      nbex:  ['1', ],
    });
    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  onSubmit()
  {
    this.isSubmitted = true;
    if (!this.qrcodegenForm.valid)
    {
      return;
    }
    else
    {
      window.open(environment.apiroot + 'pdfqrcode?bouticid=' + this.lginf.getBouticId() + '&methv='
        + this.qrcodegenForm.value.methv + '&nbtable=' + this.qrcodegenForm.value.nbtable +
        '&nbex=' + this.qrcodegenForm.value.nbex);
    }
  }

  gotoUpperPage()
  {
    this.router.navigate(['admin/main'], {replaceUrl: true});
  }
}




