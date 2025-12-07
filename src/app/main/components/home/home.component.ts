import { DbacessService } from '../../services/dbacess.service';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { strings } from 'src/app/shared/string';
import { Boutic } from '../../enums/model.enum';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import { Component, OnInit, inject, viewChild } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Router } from '@angular/router';
import { ActiveSubscriptionService } from 'src/app/shared/services/activesubscription.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxScannerQrcodeComponent,
  LOAD_WASM,
  NgxScannerQrcodeService,
  ScannerQRCodeSelectedFiles, ScannerQRCodeConfig, ScannerQRCodeResult
} from 'ngx-scanner-qrcode';
import { AfterViewInit } from '@angular/core';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    CommonModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    NgxScannerQrcodeComponent
  ],
  standalone: true
})
export class HomeComponent implements AfterViewInit {
  dbas = inject(DbacessService);
  private lginf = inject(LogininfoService);
  dialog = inject(MatDialog);
  router = inject(Router);
  protected activesub = inject(ActiveSubscriptionService);
  private qrcode = inject(NgxScannerQrcodeService);

  list = new Array<Boutic>();
  //boutic = {id:0, alias:'', nom:'', logo:''};
  myControl = new FormControl<string | Boutic>('');
  options: Boutic[] = [];
  filteredOptions!: Observable<Boutic[]>;
  loadingState = true;

  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];

  readonly action = viewChild.required<NgxScannerQrcodeComponent>('action');

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#front_and_back_camera
  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth
      },
    },
    // canvasStyles: [
    //   { /* layer */
    //     lineWidth: 1,
    //     fillStyle: '#00950685',
    //     strokeStyle: '#00950685',
    //   },
    //   { /* text */
    //     font: '17px serif',
    //     fillStyle: '#ff0000',
    //     strokeStyle: '#ff0000',
    //   }
    // ],
  };

  ngOnInit()
  {
    this.dbas.getBoutics().then(async(prom) => {
      prom.subscribe({
        next:(data1:string[]) =>
          data1.forEach((dat,idx) =>
            this.options.push({id:+dat[0], alias:dat[1], nom:dat[2], logo:dat[3], stripecustomerid:dat[4]})
          ),
        complete:() => {
          this.loadingState = false;
          this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => {
              const name = typeof value === 'string' ? value : value?.nom;
              return name ? this._filter(name as string) : this.options.slice();
            }),
          );
          this.applyConstraints();
        },
        error:(err:any) => {
          this.openDialog(strings.ErrConnect, err.error.error);
        }
      });
    })
  }

  displayFn(boutic: Boutic): string {
    return boutic && boutic.nom ? boutic.nom : '';
  }

  private _filter(name: string): Boutic[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.nom.toLowerCase().includes(filterValue));
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  routeTo(alias: string) {
    this.router.navigate([alias]);
  }

  ngAfterViewInit(): void {
    this.action().isReady.subscribe((res: any) => {
      this.handle(this.action(), 'start');
      this.applyConstraints();
    });
  }

  onEvent(e: ScannerQRCodeResult[], action?: any): void {
    // e && action && action.pause();
    //console.log(e[0].value);
    open(e[0].value, '_self');
  }

  handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => {/*console.log(fn, r), alert*/});
    } else {
      action[fn]().subscribe((r: any) => {/*console.log(fn, r), alert*/});
    }
  }

  openQuitConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '250px',
      data: { message: strings.MessageQuitAsk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.loadingState = true;
        window.location.href = strings.URLShowcaseWebsite;
      }
    });
  }

  quittermenu()
  {
    this.openQuitConfirmationDialog();
  }

  applyConstraints() {
    const constrains = this.action().applyConstraints({
      ...this.action().getConstraints(),
      width: 510
    });
    /*console.log(constrains);*/
  }




}
