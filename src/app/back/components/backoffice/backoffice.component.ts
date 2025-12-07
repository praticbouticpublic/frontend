import { Component, inject } from '@angular/core';
import { ModeleService } from '../../services/model.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { environment } from 'src/environments/environment';
import * as myGlobals from './../../../global';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'app-backoffice',
    templateUrl: './backoffice.component.html',
    styleUrls: ['./backoffice.component.scss'],
    imports: [MatCard, MatCardContent, MatButton]
})

export class BackofficeComponent {
  dialog = inject(MatDialog);
  router = inject(Router);
  private lginf = inject(LogininfoService);
  private http = inject(HttpClient);


  resp: any;

  ngOnInit()
  {
    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
  }

  async razctrl()
  {
    this.openDialogRazMem();
  }

  openDialogRazMem() {
    const dialogRef = this.dialog.open(DialogContentExample);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true)
      {
        const total = localStorage.length;
        const list = new Array();
        for (let i=0; i<total; i++)
        {
          const key = localStorage.key(i);
          if (key?.startsWith('praticboutic_paginator_' + this.lginf.getBouticId()))
          {
            list.push(key);
          }
        }
        while (list.length > 0)
        {
          localStorage.removeItem(list.pop());
        }
      }
    });
  }

  chgemail()
  {
    this.router.navigate(['admin/transfer/radressing']);
  }

  exit()
  {
    this.router.navigate(['admin/main']);
  }

  deleteboutic()
  {

    const obj = { bouticid: this.lginf.getBouticId(), email: this.lginf.getIdentifiant()};
    this.http.post<any>(environment.apiroot + 'suppression', obj, myGlobals.httpOptions).subscribe({
      next:(data:string) =>
      {
        this.exit();
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  suppression()
  {
    const dialogRef = this.dialog.open(DialogContentSuppression);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true)
      {
        const dialogRef2 = this.dialog.open(DialogContentSuppressionBis);

        dialogRef2.afterClosed().subscribe(result2 => {
          if (result2 === true)
          {
            this.deleteboutic();
          }
        });
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

@Component({
    selector: 'dialog-raz-mem',
    templateUrl: 'dialog-raz-mem.html',
    imports: [MatDialogModule, MatButtonModule]
})
export class DialogContentExample {}

@Component({
  selector: 'dialog-suppression',
  templateUrl: 'dialog-suppression.html',
  imports: [MatDialogModule, MatButtonModule]
})
export class DialogContentSuppression {}

@Component({
  selector: 'dialog-suppressionbis',
  templateUrl: 'dialog-suppressionbis.html',
  imports: [MatDialogModule, MatButtonModule]
})
export class DialogContentSuppressionBis {}
