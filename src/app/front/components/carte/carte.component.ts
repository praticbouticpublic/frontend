import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { concatMap, exhaustMap, map, pipe, switchMap, tap } from 'rxjs';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { environment } from 'src/environments/environment';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { MatSelect, MatOption } from '@angular/material/select';
import { OrderService } from '../../services/order.service';
import { SessionfrontService } from '../../services/sessionfront.service';
import { strings } from 'src/app/shared/string';
import { TypeMethod } from '../../enum/typemethod.enum';
import { TypeOrderline } from '../../enum/typeorderline.enum';
import { Article, Categorie, Groupe, Image, Option } from '../../enum/model.enum';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-carte',
    templateUrl: './carte.component.html',
    styleUrls: ['./carte.component.scss'],
    imports: [MatProgressSpinner, NgbCarousel, NgbSlide, MatFormField, MatInput, MatLabel, MatSelect, MatOption, MatButton, DecimalPipe]
})

export class CarteComponent
{
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private order = inject(OrderService);
  private session = inject(SessionfrontService);
  private header = inject(HeaderService);


  heightfortheBottom = '0px';
  loadingState = true;
  method = TypeMethod.CLICKNCOLLECT;
  table = 1;
  logo = '';
  nom = '';
  srvroot = environment.srvroot;
  mntcmdmini = 0;
  sizeimg = '';
  categories: Categorie[] = new Array();
  articles: Article[][] = new Array();
  images: Image[] = new Array();
  groupes: Groupe[] = new Array();
  somme = 0;
  nocat = 0;
  noart: number[] = new Array();
  nogrp = 0;

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


  async ngOnInit(): Promise<void>
  {
    this.logo = this.session.getLogo();
    this.method = this.session.getMethod();
    this.nom = this.session.getNomBoutic();
    window.addEventListener('resize', () => {
      this.setheightfortheBottom();
    });
    await this.getSession();
  }

  async getSession() {
    let objBouticGS = { requete: "getSession" };
    this.httpClient.post<any>(environment.apiroot + 'front', objBouticGS, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.session.setMethod(+data[0].body.method);
        this.session.setTable(+data[0].body.table);
        this.getParamMntCmdMin();
      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }


  async getParamMntCmdMin() {
    const objmntcmdmini = { requete: "getparam", bouticid: this.session.getBouticId(), param: "MntCmdMini" };
    this.httpClient.post<any>(environment.apiroot + 'front', objmntcmdmini, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.mntcmdmini = data[0];
        this.getParamSizeImg();
      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }

  async getParamSizeImg() {
    const objsizeimg = { requete: "getparam", bouticid: this.session.getBouticId(), param: "SIZE_IMG" };
    this.httpClient.post<any>(environment.apiroot + 'front', objsizeimg, await this.header.buildHttpOptions()).subscribe({
      next:(data:any) => {
        this.sizeimg = data[0];
        this.getCategories();
      },
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }


  async getCategories() {
    let objcat = { bouticid: this.session.getBouticId(), requete:"categories" };
    this.httpClient.post<Categorie[]>(environment.apiroot + 'front', objcat, await this.header.buildHttpOptions()).pipe(
      map((categories: Categorie[]) => {
        return categories.map((categorie: any) => {
          return { id: +categorie[0], nom: categorie[1], active: !!+categorie[2], open: true };
        });
      })
    ).subscribe({
      next:(categories:Categorie[]) => {
        this.categories = categories;
        this.nocat = 0;
        this.noart[this.nocat] = 0;
        if (categories.length > 0)
          this.getArticles(this.categories[this.nocat]);
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getArticles(categorie:Categorie) {
    let objart = { bouticid: this.session.getBouticId(), requete:'articles', catid: categorie.id };
    this.httpClient.post<Article[]>(environment.apiroot + 'front', objart, await this.header.buildHttpOptions()).pipe(
      map((articles: Article[]) => {
        return articles.map((article: any) => {
            return { id: +article[0], nom: article[1], prix: +article[2], unite: article[3], description: article[4],
            categorie, image: article[5], qte: this.getStoredQte(+article[0]), listimg: new Array(), groupes: new Array(), current: this.getStoredCur(+article[0])};
        });
      })
    ).subscribe({
      next:(articles:Article[]) => {
        this.articles.push(articles);
        if (articles.length > 0)
          this.getImages(this.articles[this.nocat][this.noart[this.nocat]]);
        else if ((this.nocat + 1) < this.categories.length)
        {
          this.nocat++;
          this.noart[this.nocat] = 0;
          this.getArticles(this.categories[this.nocat]);
        }
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getImages(article:Article) {
    let objimg = { bouticid: this.session.getBouticId(), requete:'images', artid: article.id };
    this.httpClient.post<Image[]>(environment.apiroot + 'front', objimg, await this.header.buildHttpOptions()).pipe(
      map((images: Image[]) => {
        return images.map((image: any) => {
          let count = 0;
          return { artid: +this.articles[this.nocat][this.noart[this.nocat]].id, image: image.image, loaded: false };
          count++;
        });
      })
    ).subscribe({
      next:(images:Image[]) => {
        this.articles[this.nocat][this.noart[this.nocat]].listimg = images;
        this.nogrp = 0;
        this.getGroupes(this.articles[this.nocat][this.noart[this.nocat]]);
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getGroupes(article:Article) {
    let objgrp = { bouticid: this.session.getBouticId(), requete:'groupesoptions', artid: article.id };
    this.httpClient.post<Groupe[]>(environment.apiroot + 'front', objgrp, await this.header.buildHttpOptions()).pipe(
      map((groupes: Groupe[]) => {
        return groupes.map((groupe: any) => {
          return { id: +groupe[0], nom: groupe[1], multi: !!+groupe[2], options:new Array(), selection: new Array() };
        });
      })
    ).subscribe({
      next:(groupes:Groupe[]) => {
        this.articles[this.nocat][this.noart[this.nocat]].groupes = groupes;
        this.totaliser();
        if (groupes.length > 0)
          this.getOptions(groupes[this.nogrp]);
        else if ((this.noart[this.nocat]+1) < this.articles[this.nocat].length)
        {
          this.noart[this.nocat]++;
          if (this.noart[this.nocat] < this.articles[this.nocat].length)
            this.getImages(this.articles[this.nocat][this.noart[this.nocat]]);
        }
        else
        {
          this.nocat++;
          this.noart[this.nocat] = 0;
          if (this.nocat < this.categories.length )
            this.getArticles(this.categories[this.nocat])
        }

      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  async getOptions(grp:Groupe) {
    let objopt = { bouticid: this.session.getBouticId(), requete:'options', grpoptid: grp.id };
    this.httpClient.post<Option[]>(environment.apiroot + 'front', objopt, await this.header.buildHttpOptions()).pipe(
      map((options: Option[]) => {
        return options.map((option: any) => {
          return { id: +option[0], nom: option[1], surcout: +option[2], selected: false };
        });
      })
    ).subscribe({
      next:(options:Option[]) => {
        this.articles[this.nocat][this.noart[this.nocat]].groupes[this.nogrp].options = options;
        if (this.articles[this.nocat][this.noart[this.nocat]].qte)
        {
          for(let cur = 1; cur <= this.articles[this.nocat][this.noart[this.nocat]].qte; cur++)
          {
            if (grp.options.length > 0)
            {
              if (grp.multi)
                grp.selection[cur-1] = this.getStoredGrpSel(this.articles[this.nocat][this.noart[this.nocat]].id, grp.id, cur) as number[];
              else
              {
                let optsel = this.getStoredGrpSel(this.articles[this.nocat][this.noart[this.nocat]].id, grp.id, cur) as number;
                if (!optsel)
                  grp.selection[cur-1] = options[0].id;
                else
                  grp.selection[cur-1] = optsel;
              }
            }
          }
        }

        this.nogrp++;
        if (this.nogrp < this.articles[this.nocat][this.noart[this.nocat]].groupes.length)
          this.getOptions(this.articles[this.nocat][this.noart[this.nocat]].groupes[this.nogrp])
        else if (this.noart[this.nocat] + 1 <  this.articles[this.nocat].length)
        {
          this.noart[this.nocat]++;
          this.getImages(this.articles[this.nocat][this.noart[this.nocat]]);
        }
        else
        {
          this.nocat++;
          this.noart[this.nocat] = 0;
          if (this.nocat < this.categories.length)
            this.getArticles(this.categories[this.nocat]);
        }
      },
      error:(err:any) => {
        this.openErrDialog(strings.ErrConnect, err.error.error);
      }
    });
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

  addQt(art: Article)
  {
    art.qte++;
    art.groupes.forEach((grp) =>{
      if ((!grp.multi) && (grp.options.length > 0))
      {
        grp.selection[(art.qte - 1)] = grp.options[0].id;
        sessionStorage.setItem('artid' + art.id + 'grpid' + grp.id + 'cur' + (art.qte - 1), String(grp.options[0].id));
      }
    });
    if (art.current < 1)
    {
      art.current = 1;
      this.setStoredCur(art.id, art.current);
    }
    this.setStoredQte(art.id, art.qte);
    this.totaliser();
  }

  subQt(art: Article)
  {
    if (art.qte > 0)
    {
      art.qte--;
      this.setStoredQte(art.id, art.qte);
      art.groupes.forEach((grp) =>{
        grp.selection.pop();
        sessionStorage.removeItem('artid' + art.id + 'grpid' + grp.id + 'cur' + art.current);
      });
      art.current = art.qte;
      this.setStoredCur(art.id, art.current);

    }
    this.totaliser();
  }

  totaliser()
  {
    this.somme = 0;
    this.articles.forEach((arti) =>
      arti.forEach((art) =>
      {
        this.somme = this.somme + (art.qte * art.prix);
        art.groupes.forEach((grp) =>
          grp.selection.forEach((sel) =>
          {
            for(let s of this.toArray(sel))
              grp.options.forEach((opt) =>
                this.somme += ((+s === opt.id) ? (opt.surcout) : 0));
          }
        ))
      })
    )
  }

  setNewValue(val: any, art:Article, idxgrp: number, idx: number)
  {
    if (art.groupes[idxgrp].multi)
      art.groupes[idxgrp].selection[idx-1] = val as number[];
    else
      art.groupes[idxgrp].selection[idx-1] = val as number;
    this.setStoredGrpSel(art.id, art.groupes[idxgrp].id, idx, val);
    this.totaliser();
  }

  setheightfortheBottom()
  {
    this.heightfortheBottom = ((window.innerHeight - this.footer_().nativeElement.clientHeight - this.header_().nativeElement.clientHeight) as number) + "px";
  }

  setart(art: Article, val:number)
  {
    art.current = art.current + val;
    this.setStoredCur(art.id, art.current);
  }

  Poursuivre()
  {
    if (this.somme >= this.mntcmdmini)
    {
      this.enregistrerlacommande();
      this.router.navigate(['boutic/getinfo'])
    }
    else
    {
      this.openDialog(strings.CantContinue, strings.MntCmdMiniErr);
    }
  }

  enregistrerlacommande() {
    this.order.setOrderLenght(0);
    this.articles.forEach((arti) =>
      arti.forEach((art) =>
      {
        let options = '';
        art.groupes.forEach((grp) =>
          grp.selection.forEach((sel) =>
          {
            for(let s of this.toArray(sel))
              grp.options.forEach((opt) =>
                options += ((+s === opt.id) ? ((grp.multi ? ' + ' : ' / ') + opt.nom) : ''));
          })
        )
        options += '\n';
        if (art.qte)
          this.order.addOrderline(String(art.id), TypeOrderline.article, art.nom, String(art.prix), String(art.qte), art.unite, options, art.description);
        art.groupes.forEach((grp) =>
          grp.selection.forEach((sel) =>
          {
            for(let s of this.toArray(sel))
              grp.options.forEach((opt) =>
              {
                if(+s === opt.id)
                  this.order.addOrderline(String(opt.id), TypeOrderline.option, opt.nom, String(opt.surcout), '1', art.unite, '', '');
              });
          }
        ))
      })
    )
    this.order.setSousTotal(this.somme);
    this.order.setArticles(this.articles);
    this.order.Enregistrement();
  }

  toArray(n: any): Array<any>
  {
    let arr = Array();
    if (!n.length)
    {
      arr.push(n);
      return arr;
    }
    else
      return n;
  }

  getStoredQte(artid: number): number
  {
    let qte = sessionStorage.getItem('artid' + artid + 'qte');
    return ((qte !== null) ? +qte : 0);
  }

  setStoredQte(artid: number, qte: number)
  {
    sessionStorage.setItem('artid' + artid + 'qte', String(qte));
  }

  getStoredCur(artid: number): number
  {
    let cur = sessionStorage.getItem('artid' + artid + 'cur');
    return ((cur !== null) ? +cur : 0);
  }

  setStoredCur(artid: number, cur: number)
  {
    sessionStorage.setItem('artid' + artid + 'cur', String(cur));
  }

  getStoredGrpSel(artid:number, grpid: number, cur:number): any
  {
    let sele = sessionStorage.getItem('artid' + artid + 'grpid' + grpid + 'cur' + cur);
    return ((sele !== null) ? JSON.parse(sele) : '');
  }

  setStoredGrpSel(artid:number, grpid: number, cur:number, selection: any)
  {
    sessionStorage.setItem('artid' + artid + 'grpid' + grpid + 'cur' + cur, JSON.stringify(selection));
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


