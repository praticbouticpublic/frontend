import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SessionfrontService } from '../../services/sessionfront.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { environment } from 'src/environments/environment';
import { strings } from 'src/app/shared/string';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-fin',
    templateUrl: './fin.component.html',
    styleUrls: ['./fin.component.scss'],
    imports: [MatProgressSpinner]
})

export class FinComponent {
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private order = inject(OrderService);
  private session = inject(SessionfrontService);
  public header = inject(HeaderService);


  loadingState = true;
  srvroot = environment.srvroot;
  heightfortheBottom = '0px";'
  logo = '';
  nom = '';

  readonly header_ = viewChild.required<ElementRef>('header');
  readonly footer_ = viewChild.required<ElementRef>('footer');

  getShowBarre() : boolean
  {
    return (sessionStorage.getItem('barre') !== 'fermer');
  }

  setShowBarre(etat: boolean)
  {
    sessionStorage.setItem('barre', etat ? 'fermer' : '');
  }

  async ngOnInit()
  {
    this.logo = this.session.getLogo();
    this.nom = this.session.getNomBoutic();

    let commande = {
      nom: this.order.getNom(),
      prenom: this.order.getPrenom(),
      adresse1: this.order.getAdr1(),
      adresse2: this.order.getAdr2(),
      codepostal: this.order.getCodePostal(),
      ville: this.order.getVille(),
      telephone: this.order.getTelephone(),
      paiement: this.order.getPaiement(),
      vente: this.order.getVente(),
      infosup: this.order.getInfoSup(),
      items: this.order.getCommande(),
      fraislivr: this.order.getFraisLivr(),
      remise: this.order.getRemise()
    };
    if (commande.items.length > 0)
    {
      this.httpClient.post<any>(environment.apiroot + 'depart-commande', commande, await this.header.buildHttpOptions()).subscribe({
        next:(data:any) =>
        {
          this.header.setToken(data.token);
          this.order.razOrder();
          this.order.removeMemControl();
          this.loadingState = false;
        },
        error:(err:any) =>
        {
          this.openErrDialog(strings.ErrConnect, err.error.error);
          this.router.navigate(['boutic/paiement']);
        }
      });
    }
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  setheightfortheBottom()
  {
    this.heightfortheBottom = ((window.innerHeight - this.footer_().nativeElement.clientHeight - this.header_().nativeElement.clientHeight) as number) + "px";
  }

  gotoDebut()
  {
    this.router.navigate(['boutic/debut/' + this.session.getAliasBoutic() + '/' + this.session.getMethod() + '/' + this.session.getTable()]);
  }

  ngAfterViewChecked()
  {
    setTimeout(() => {
      this.setheightfortheBottom();
    }, 100);
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
