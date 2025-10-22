import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, NgZone, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { environment } from 'src/environments/environment';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {HeaderService} from "../../../shared/services/header.service";
@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
    styleUrls: ['./money.component.scss'],
    imports: [MatProgressSpinner]
})
export class MoneyComponent {
  private httpClient = inject(HttpClient);
  private lgser = inject(LogininfoService);
  dialog = inject(MatDialog);
  private _ngZone = inject(NgZone);
  private header = inject(HeaderService);

  loaded = false;

  ngOnInit()
  {
    this._ngZone.run(async () => {
      const postData = {
        bouticid : this.lgser.getBouticId(),
        platform: 'web'
      };
      this.httpClient.post<any>(environment.apiroot + 'login-link', postData, await this.header.buildHttpOptions()).subscribe({
        next:(data: any) => {
          this.header.setToken(data.token);
          window.open(String(data.url), '_blank');
          this.loaded = true;
          window.history.back();
        },
        error:(err: any) => {
          this.openErrDialog(strings.ErrConnect, err.error.error);
          this.loaded = true;

        }
      });
    });
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      window.history.back();
    });
  }
}
