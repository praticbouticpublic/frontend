import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SessionfrontService } from '../../services/sessionfront.service';
import { environment } from 'src/environments/environment';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { strings } from 'src/app/shared/string';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-debut',
    templateUrl: './debut.component.html',
    styleUrls: ['./debut.component.scss'],
    imports: [MatProgressSpinner]
})
export class DebutComponent {
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private order = inject(OrderService);
  private session = inject(SessionfrontService);
  private header = inject(HeaderService);


  ngOnInit() : void
  {
        this.order.razOrder();
        this.session.razSessionFront();
        sessionStorage.removeItem('barre');
        this.route.params.subscribe((params: Params) => {
          document.cookie = "ggCookie=ggCookie";
          this.session.setAliasBoutic(params['customer']);
          this.session.setMethod(params['method']);
          this.session.setTable(params['table']);
          this.initSession();
        });
  }

  async initSession()
  {
    let objBouticIS = { requete: "initSession", customer: this.session.getAliasBoutic(), method: this.session.getMethod(), table: this.session.getTable() };
    this.httpClient.post<string>(environment.apiroot + 'front', objBouticIS, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.header.setToken(data[0].body.token);
        this.getBouticInfo();
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getBouticInfo() {
    const objbouticinf = { requete: "getBouticInfo", customer: this.session.getAliasBoutic() };
    this.httpClient.post<any>(environment.apiroot + 'front', objbouticinf, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        let bouticid = +data[0];
        if (bouticid)
        {
          this.session.setBouticId(bouticid);
          this.session.setLogo(data[1]);
          this.session.setNomBoutic(data[2]);
          this.getAboActif();
        }
        else
          this.openConfirmationDialog();
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getAboActif()
  {
    const objaboactif = { requete: "aboactif", bouticid: this.session.getBouticId()};
    this.httpClient.post<Object>(environment.apiroot + 'front', objaboactif, await this.header.buildHttpOptions()).subscribe({
      next:(abo:Object) => {
        if (abo === null)
          this.openDialog(strings.ErrConnect, strings.NoActiveSubscription);
        else
          this.router.navigate(['boutic/carte']);
      },
    error:(err:any) => {
      this.openErrDialog(strings.ErrConnect, err.error.error);
    }});
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title: strings.Error, body: strings.NoBoutic }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      window.location.href = strings.URLShowcaseWebsite;
    });
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate([this.session.getAliasBoutic(true) + '/' + this.session.getMethod(true) + '/' + this.session.getTable(true)])
    });
  }
}
