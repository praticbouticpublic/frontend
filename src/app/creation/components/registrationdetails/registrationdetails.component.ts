import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { strings } from 'src/app/shared/string';
import { CreationbouticService } from 'src/app/shared/services/creationboutic.service';
import { environment } from 'src/environments/environment';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatError, MatFormField, MatInput, MatSuffix, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatCardActions } from '@angular/material/card';
import { MatFabButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";
@Component({
    selector: 'app-registrationdetails',
    templateUrl: './registrationdetails.component.html',
    styleUrls: ['./registrationdetails.component.scss'],
    imports: [MatProgressSpinner, ReactiveFormsModule, MatRadioGroup, MatRadioButton, MatError, MatFormField, MatInput, MatIcon, MatSuffix, MatLabel, MatCardActions, MatFabButton]
})
export class RegistrationdetailsComponent
{
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private httpClient = inject(HttpClient);
  private lginfser = inject(LogininfoService);
  private creabou = inject(CreationbouticService);
  private header = inject(HeaderService);


  loadingstate = false;
  regdetailsFormGroup!: FormGroup<any>;
  hide = true;
  hideconf = true;
  isSubmited = false;

  ngOnInit()
  {
    this.loadingstate = false;

    this.regdetailsFormGroup = this.formBuilder.group({
      pass: ['', [Validators.required, Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*?]).{8,}'),
        Validators.maxLength(255)]],
      passconf: ['', [Validators.required, Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*?]).{8,}'),
        Validators.maxLength(255)]],
      qualite: ['', [Validators.required]],
      nom: ['', [Validators.required, Validators.maxLength(60)]],
      prenom: ['', [Validators.required, Validators.maxLength(60)]],
      adr1: ['', [Validators.required, Validators.maxLength(150)]],
      adr2: ['', [Validators.maxLength(150)]],
      cp: ['', [Validators.required, Validators.pattern('[0-9]{5}'), Validators.maxLength(5)]],
      ville: ['', [Validators.required, Validators.maxLength(50)]],
      tel: ['', [Validators.required, Validators.pattern('(^(?:0|\\(?\\+33\\)?\\s?|0033\\s?)[0-9](?:[\\.\\-\\s]?\\d\\d){4}$)')]]
    });
  }

  async onSubmitRegdetails(): Promise<boolean>
  {
    this.isSubmited = true;

    if (this.regdetailsFormGroup.value.pass !== this.regdetailsFormGroup.value.passconf)
    {
      this.openDialog(strings.CantContinue, strings.PassordDiffer);
      return false;
    }

    if (!this.regdetailsFormGroup.valid)
    {
      return false;
    }

    this.loadingstate = true;

    this.lginfser.setMotdepasse(this.regdetailsFormGroup.value.pass).then(() => {
      return this.lginfser.getMotdepasse();
    }).then((motdepasse: string) => {
      this.creabou.setClient(
        this.lginfser.getIdentifiant(),
        motdepasse,
        this.regdetailsFormGroup.value.qualite,
        this.regdetailsFormGroup.value.nom,
        this.regdetailsFormGroup.value.prenom,
        this.regdetailsFormGroup.value.adr1,
        this.regdetailsFormGroup.value.adr2,
        this.regdetailsFormGroup.value.cp,
        this.regdetailsFormGroup.value.ville,
        this.regdetailsFormGroup.value.tel
      );
    }).catch((error) => {
      console.error('Erreur lors du traitement du mot de passe :', error);
      // Afficher un message d'erreur à l'utilisateur ou gérer l'erreur d'une autre manière
    });




    const regmobpostData = {
      pass: this.regdetailsFormGroup.value.pass,
      qualite : this.regdetailsFormGroup.value.qualite,
      nom : this.regdetailsFormGroup.value.nom,
      prenom : this.regdetailsFormGroup.value.prenom,
      adr1 : this.regdetailsFormGroup.value.adr1,
      adr2 : this.regdetailsFormGroup.value.adr2,
      cp : this.regdetailsFormGroup.value.cp,
      ville : this.regdetailsFormGroup.value.ville,
      tel : this.regdetailsFormGroup.value.tel
    };

    this.httpClient.post(environment.apiroot + 'registration', regmobpostData, await this.header.buildHttpOptions())
    .subscribe({
      next:(data:any) => {
        this.header.setToken(data.token);
        if (data.result === 'OK')
        {
          this.router.navigate(['admin/creation/shopdetails']);
          return true;
        }
        this.loadingstate = false;
        return false;
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
        this.loadingstate = false;
        return false;
      }
    });
    this.loadingstate = false;
    this.isSubmited = false;
    return false;
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
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

