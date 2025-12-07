import { Component, inject } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { UpperCasePipe, TitleCasePipe } from '@angular/common';

export interface tab {
  action: string[];
  nom: string;
  active: boolean;
}

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
    imports: [MatTabNav, MatTabLink, RouterLink, RouterLinkActive, MatTabNavPanel, RouterOutlet, UpperCasePipe, TitleCasePipe]
})
export class TabsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lginf = inject(LogininfoService);

  title = '';
  links : tab[] = new Array;
  tabs = '';
  activeLink = 0;
  table = '';

  ngOnInit()
  {
    this.route.params.subscribe((params: Params) => {
      this.tabs = params['tabs'];
      //let lasttab = (String(localStorage.getItem('lasttab_' + this.lginf.getBouticId()) ?? '') === '') ? -1 : +String(localStorage.getItem('lasttab_' + this.lginf.getBouticId()));
      let lasttab = -1;
      this.links.length = 0;
      this.activeLink = 0;
      switch(this.tabs)
      {
        case 'orders':
          this.title = 'Commandes';
          let orders: tab = {
            action : ['displaytable', 'commande'],
            nom : 'COMMANDES CLIENTS',
            active: true
          }
          this.links.push(orders);
        break;
        case 'products':
          this.title = 'Produits';
          let categories: tab = {
            action : ['displaytable', 'categorie'],
            nom : 'CATEGORIES',
            active: (lasttab === 0)
          };
          let articles: tab = {
            action : ['displaytable', 'article'],
            nom : 'ARTICLES',
            active: (lasttab === -1) || (lasttab === 1),
          };
          let groupes: tab = {
            action : ['displaytable', 'groupeopt'],
            nom : 'GROUPES D\'OPTIONS',
            active: (lasttab === 2)
          };
          this.links.push(categories);
          this.links.push(articles);
          this.links.push(groupes);
        break;
        case 'deliveries':
          this.title = 'Livraisons';
          let zones: tab = {
            action : ['displaytable', 'cpzone'],
            nom : 'ZONES DE LIVRAISONS',
            active: (lasttab === 0)
          };
          let baremes: tab = {
            action : ['displaytable', 'barlivr'],
            nom : 'BAREMES DE LIVRAISONS',
            active: (lasttab === -1) || (lasttab === 1)
          };
          this.links.push(zones);
          this.links.push(baremes);
        break;
        case 'discounts':
          this.title = 'Promotions';
          let promos: tab = {
            action : ['displaytable', 'promotion'],
            nom : 'PROMOTIONS',
            active: true
          };
          this.links.push(promos);
        break;
        case 'customerarea':
          this.title = 'Espace Client';
          let shop: tab = {
            action : ['shop'],
            nom : 'BOUTIC',
            active: (lasttab === -1) || (lasttab === 0)
          };
          let settings: tab = {
            action : ['settings'],
            nom : 'REGLAGES',
            active: (lasttab === 1)
          };
          let backoffice: tab = {
            action : ['backoffice'],
            nom : 'BACK-OFFICE',
            active: (lasttab === 2)
          };
          let qrcodegenerator: tab = {
            action : ['qrcodegenerator'],
            nom : 'GENERATEUR DE QRCODE',
            active: (lasttab === 3)
          };
          let client: tab = {
            action : ['client'],
            nom : 'CLIENT',
            active: (lasttab === 4)
          };
          this.links.push(shop);
          this.links.push(settings);
          this.links.push(backoffice);
          this.links.push(qrcodegenerator);
          this.links.push(client);
        break;
      }
      let actlnk = this.getActivelink();
      //let lasturl = String(localStorage.getItem('lasturl_' + this.lginf.getBouticId()) ?? '');
      //if (lasturl === '')
      //{
        let stractlnk = '';
        actlnk.action.forEach(element => {
          stractlnk += '/';
          stractlnk += element;
        });
        this.router.navigate(['admin/backoffice/tabs/' + this.tabs + stractlnk]);
        localStorage.setItem('lasturl_' + this.lginf.getBouticId(), 'admin/backoffice/tabs/' + this.tabs + stractlnk);
      //}
    });
  }

  getActivelink(): tab  {
    let retlnk: any;
    this.links.forEach((lnk,idx) => {
      if (lnk.active)
      {
        this.activeLink = idx;
        retlnk = lnk;
      }
    });
    if (localStorage.getItem('lasttab_' + this.lginf.getBouticId()) === null)
      this.bakLastTab();

    return retlnk;
  }

  bakLastTab()
  {
    localStorage.setItem('lasttab_' + this.lginf.getBouticId(), String(this.activeLink));
  }

}
