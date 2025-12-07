import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import * as myGlobals from './../../../global';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton, MatFabButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";
@Component({
    selector: 'app-changification',
    templateUrl: './changification.component.html',
    styleUrls: ['./changification.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, MatFabButton]
})
export class ChangificationComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private lginf = inject(LogininfoService);
  private header = inject(HeaderService);

  logout = false;
  loadingstate = true;
  changificationFormGroup: any = FormGroup;
  long = 6;
  email = '';
  lecode ='';

  get code(): string {
    return this.changificationFormGroup.value.code;
  }

  hexToUint8Array(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  ngOnInit()
  {
    this.route.params.subscribe((params: Params) => {
      this.email = params['courriel'];;
      this.loadingstate = false;
      this.changificationFormGroup = this.formBuilder.group({
        code: ['', [Validators.required, Validators.pattern('^[0-9]{6}'), Validators.maxLength(6)]]
      });
      this.sendCode(null);
    })
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
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

  // Function to convert a Base64 string to a Uint8Array (16-byte array)
  base64ToUint8Array(base64: string): Uint8Array
  {
    // Decode the Base64 string
    const binaryString = atob(base64);

    // Create a Uint8Array with the same length as the decoded string
    const byteArray = new Uint8Array(binaryString.length);

    // Convert each character to its byte value
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }

    return byteArray;
  }

  async sendCode(elem: any)
  {
    if (elem !== null)
    {
      elem.disabled = true;
    }

    const sendcodepostData = {
      email: this.email
    };

    this.http.post<any>(environment.apiroot + 'send-code', sendcodepostData, await this.header.buildHttpOptions())
    .subscribe({
      next:async (data:any[]) => {
        const rawKey = new Uint8Array(this.hexToUint8Array(environment.identificationkey)); // clé hex → bytes

        crypto.subtle.importKey('raw', rawKey, { name: 'AES-CBC' }, false, ['decrypt'])
          .then(key => {
            const iv = new Uint8Array(this.base64ToUint8Array(data[1]));
            const encrypted = new Uint8Array(this.base64ToUint8Array(data[0]));

            crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encrypted)
              .then(decrypted => {
                this.lecode = new TextDecoder().decode(decrypted);
                if (elem !== null) elem.disabled = false;
              })
              .catch(err => {
                console.error("Decryption failed:", err);
                this.openDialog("Erreur", "Échec du déchiffrement");
              });
          });
      },
      error:(err:any) => {
        if (elem !== null)
        {
          elem.disabled = false;
        }
        this.openDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  onSubmitChangification() : void
  {
    if (!this.changificationFormGroup.valid)
    {
      return ;
    }
    else
    {
      if (this.code === this.lecode)
      {
        this.radressboutic();
      }
      else
      {
        this.openDialog(strings.CantContinue, strings.MessageCodeMismatch);
      }

    }
  }

  async radressboutic()
  {

    const obj = { email: this.email};
    this.http.post<any>(environment.apiroot + 'radress-boutic', obj, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) =>
      {
        this.header.setToken(data.token);
        this.lginf.setIdentifiant(this.email);
        this.gotoAdmin();
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  gotoAdmin()
  {
    this.router.navigate(['admin/backoffice/tabs/customerarea/backoffice']);
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
