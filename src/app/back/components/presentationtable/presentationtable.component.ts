import { Component, ElementRef, Input, SimpleChanges, inject, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { ModeleService } from '../../services/model.service';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import  * as myGlobals from '../../../global';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { strings } from 'src/app/shared/string';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'src/app/shared/services/message.service';
import { rpp } from '../../../global';
import { Initialisation } from '../../initialisation';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { Observable } from 'rxjs';
import { NgClass } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";

export interface matType {
  [key: string]: string;
}

@Component({
    selector: 'app-presentationtable',
    templateUrl: './presentationtable.component.html',
    styleUrls: ['./presentationtable.component.scss'],
    imports: [MatProgressSpinner, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, MatCheckbox, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, MatFabButton, MatIcon, MatPaginator]
})
export class PresentationtableComponent extends Initialisation {
  private route = inject(ActivatedRoute);


  bouticid!: number;
  limit : number = myGlobals.deflimite;
  offset : number = myGlobals.defoffset;
  count = 0;
  data: string[][] = new Array;
  nbpage = myGlobals.rpp;
  columns: any[] = [];
  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<any>;
  clickedRows = new Set<matType>();
  actionselect = '';
  pageEvent!: PageEvent;

  @Input() table = '';
  @Input() selcol = '';
  @Input() selid = 0;
  couleur: any[] = [];
  colorready = false;
  index: any;
  routerPath ='../..';
  latable: any;
  tableloaded = false;
  handleid: any | undefined;
  linkEnabled = true;
  readonly paginator = viewChild.required<MatPaginator>('paginator');

  constructor() {
      const httpClient = inject(HttpClient);
      const activesub = inject(ActiveSubscriptionService);
      const snackbar = inject(MatSnackBar);
      const router = inject(Router);
      const model = inject(ModeleService);
      const lginf = inject(LogininfoService);
      const dialog = inject(MatDialog);
      const msg = inject(MessageService);
      const header = inject(HeaderService);

      super(httpClient, lginf, msg, model, activesub, snackbar, dialog, router, header);
  }

  ngOnInit(): void {
    super.chargementRessources();
  }

  async razParamNewCmd(): Promise<Observable<string>>
  {
    Initialisation.nbnewcmd = 0;
    const obj = { bouticid: this.lginf.getBouticId(), action:'setparam', table:'', param:'NEW_ORDER', valeur:'0' };
    return this.httpClient.post<string>(environment.apiroot + 'set-param', obj, await this.header.buildHttpOptions());
  }

  startComputeTable()
  {
    this.model.getRowCount(this.lginf.getBouticId().toString(), this.table, this.selcol,this.selid, []).then(observable =>{
      observable.subscribe({
        next:(data: any) => {
          this.count = +data.count;
          if (this.table === 'commande')
          {
            this.lireParamNewCmd().then(observable2 => {
              observable2.subscribe({
                next:(nombre: string) => {
                  Initialisation.nbnewcmd = +nombre;
                  this.shapeTablePresentation(null);
                  if (+Initialisation.nbnewcmd > 0)
                    this.razParamNewCmd().then(observable => {
                      observable.subscribe({
                        next:(data: string) => {
                        }, error:(err:any) => {
                          return ;
                        }
                      });
                    });
                  this.msg.init();
                  this.msg.getObservable().subscribe(res => {
                    if (+res)
                    {
                      this.table = "commande";
                      this.actionselect = 'viewrecord';
                      this.routerPath = '../..';
                      this.selcol = '';
                      this.selid = 0;
                      let crpp = this.getClosestRpp(+res);
                      this.shapeTablePresentation(crpp);
                    }
                  });
                },
                error:(e:any) => {
                  this.openErrDialog(strings.ErrConnect, e.error.error);
                }
              });
            })
          }
          else
            this.shapeTablePresentation(null);
        },
        error:(e:any) => {
          this.openErrDialog(strings.ErrConnect, e.error.error);
        }
      });
    })

  }

  override run()
  {
    if (this.selcol ==='')
    {
      if (localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table)===null)
      {
        this.limit = myGlobals.deflimite;
        localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table, String(this.limit));
      }
      else
        this.limit = +(localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table) as string);

      if (localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_' + this.table)===null)
      {
        this.offset = myGlobals.defoffset;
        localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table, String(this.offset));
      }
      else
        this.offset = +(localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table) as string);
    }
    else
    {
      this.limit = myGlobals.deflimite;
      this.offset = myGlobals.defoffset;
    }
    const paginator = this.paginator();
    if (paginator !== undefined)
    {
      this.count = this.limit;
      paginator.pageIndex = Math.round(this.offset / this.limit);
      paginator.pageSize = this.limit;
    }
    if (this.table === 'lignecmd')
      this.selcol = 'cmdid';
    if ((this.table === 'commande') || (this.table === 'lignecmd'))
      this.actionselect = 'viewrecord';
    else
      this.actionselect = 'updaterecord';
    if (this.selid !== 0)
      this.routerPath ='../../../../..';

    localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);

    this.startComputeTable();

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.count = 0;
    if (this.selcol ==='')
    {
      if (localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table)===null)
      {
        this.limit = myGlobals.deflimite;
        localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table, String(this.limit));
      }
      else
        this.limit = +(localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table) as string);
      if (localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table)===null)
      {
        this.offset = myGlobals.defoffset;
        localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table, String(this.offset));
      }
      else
        this.offset = +(localStorage.getItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table) as string);
    }
    else
    {
      this.limit = myGlobals.deflimite;
      this.offset = myGlobals.defoffset;
    }
    const paginator = this.paginator();
    if (paginator !== undefined)
    {
      paginator.pageIndex = Math.round(this.offset / this.limit);
      paginator.pageSize = this.limit;
    }
    this.colorready = false;
    if (this.table === 'lignecmd')
      this.selcol = 'cmdid';
    if ((this.table === 'commande') || (this.table === 'lignecmd'))
      this.actionselect = 'viewrecord';
    else
      this.actionselect = 'updaterecord';
    if ((changes['table'].currentValue !== changes['table'].previousValue) && (!changes['table'].isFirstChange())) {
      this.startComputeTable();
    }

  }

  shapeTablePresentation( crpp: number | null)
  {

    if (crpp)
    {
      this.limit = crpp;
      this.offset = this.count - (this.count % this.limit);
    }
    else if ((Initialisation.nbnewcmd > 0) && (this.table === 'commande'))
    {
      this.limit = Number(this.nbpage.find((element) => (((this.count % element) == 0) ? element : (this.count % element)) >= Initialisation.nbnewcmd));
      this.offset = this.count - (((this.count % this.limit) == 0) ? this.limit : (this.count % this.limit));
      const paginator = this.paginator();
      paginator.pageSize = this.limit;
      paginator.pageIndex = Math.round(this.offset / this.limit);
    }

    this.displayedColumns = [];

    this.columns  = Object.assign([], this.model.getTableParNom(this.table).champs);
    this.columns.forEach((col: any) => {
      if (((col.vis === 'o') || (col.typ ==='pk')) && (col.nom !== this.selcol))
      {
        if (col.typ === 'pk')
          col.desc ='pkid';
        this.displayedColumns.push(col.desc);
      }
    });
    this.model.getData(this.lginf.getBouticId().toString(), this.table, this.limit, this.offset, this.selcol, this.selid, []).then(observable =>{
      observable.subscribe({
        next:async (response) => {
          let removedrow = 0;
          this.model.getTableParNom(this.table).champs.forEach((col: any, idxcol:number) => {
            if (((col.vis !== 'o') && (col.typ !== 'pk')) || (col.nom === this.selcol))
            {
              response.data.forEach((row: any, _idxrow: any) => {
                row.splice(idxcol - removedrow, 1);
              });
              removedrow++;
            }
          });
          removedrow = 0;
          this.model.getTableParNom(this.table).champs.forEach((col: any, idxcol:number) => {
            if (((col.vis !== 'o') && (col.typ !== 'pk')) || (col.nom === this.selcol))
            {
              this.columns.splice(idxcol - removedrow, 1);
              removedrow++;
            }
          });

          this.couleur = new Array(this.limit);
          this.couleur.splice(0);
          for (let i=0; i < this.limit; i++)
          {
            this.couleur.push('#FFFFF');
          }

          if (this.table == 'commande')
          {
            const obj3 = { bouticid: this.lginf.getBouticId().toString(), action:'color-row', table:'', colonne:'', row:'', idtoup:'', limite:this.limit.toString(), offset:this.offset.toString(), selcol:'', selid:0 };

            this.httpClient.post<any>( environment.apiroot + 'color-row', obj3, await this.header.buildHttpOptions()).subscribe({
              next:(response: any) => {
                const data = response.colors;
                for( let i=0; i<data.length; i++)
                {
                  this.couleur[i] = data[i][0];
                }
                this.colorready = true;
              },
              error:(e:any) => {
                this.openErrDialog(strings.ErrConnect, e.error.error);
              }
            });
          }
          else
          {
            this.colorready = true;
          }
          this.refreshTableComponent(response.data);
        },
        error:(e:any) => {
          this.openErrDialog(strings.ErrConnect, e.error.error);
        },
      });
    });


  }

  refreshTableComponent(rows:any) : void {
    this.dataSource = new MatTableDataSource<any>([]);
    this.dataSource = new MatTableDataSource(this.convertToFlatArray( rows, this.displayedColumns ));
    this.tableloaded = true;
  }

  convertToFlatArray(input: string[][], propriete:string[]): matType[] {
    const flatArray: matType[] = [];

    for (let i = 0; i < input.length; i++) {
      let element: any=[];

      for (let j = 0; j < input[i].length; j++) {
        element[propriete[j]] = input[i][j];
      }

      flatArray.push(element);
    }

    return flatArray;
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.count = e.length;
    this.limit = e.pageSize;
    this.offset = e.pageIndex * this.limit;
    localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_limit_'+ this.table, String(this.limit));
    localStorage.setItem('praticboutic_paginator_' + this.lginf.getBouticId() + '_offset_'+ this.table, String(this.offset));
    this.shapeTablePresentation(null);
  }

  luminosite(couleur: any)
  {
    const r = parseInt(couleur.slice(1, 3), 16);
    const g = parseInt(couleur.slice(3, 5), 16);
    const b = parseInt(couleur.slice(5, 7), 16);
    const lumi = (r + g + b) / 3;
    return lumi;
  }

  getClosestRpp(nbcmd: number): number {
    let retval = 0;
    rpp.forEach((val: number,idx: any) => {
      if ((nbcmd <= val) && (!retval))
      {
        retval = val;
      }
    });
    return retval;
  }

  writeFlagToBd($event: any, rowid: any, col: any )
  {
    this.linkEnabled = false;
    let rec = new Array();
    rec.push({nom: col.nom, valeur:$event.checked ? '1' : '0', type:col.typ, desc:col.desc});
    this.model.updaterow(this.lginf.getBouticId(), this.table, rec, this.model.getTableParNom(this.table).champs[0].nom, +rowid, this);
  }

  toggleRouting()
  {
    this.linkEnabled = true;
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate(['admin/main/exit'])
    });
  }

  convertToMoney(amount:string): string{
    return parseFloat(amount).toFixed(2) + ' €';
  }

}








