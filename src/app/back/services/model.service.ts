import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import * as myGlobals from './../../global';
import {HeaderService} from "../../shared/services/header.service";

interface Publication {
  form: any;
  msg: string | null;
}

@Injectable({
  providedIn: 'root'
})



export class ModeleService {
  httpClient = inject(HttpClient);
  header = inject(HeaderService);


  tables: any;
  liens:any;
  error = new Subject<Publication>();

  chargementDbd(dbd: any)
  {
    this.tables = dbd.tables;
    this.liens = dbd.liens;
  }

  getTables()
  {
    return this.tables;
  }

  getTable(number: number)
  {
    return this.tables[number];
  }

  getnumtable(nom: string)
  {
    let numtable: any;
    for (let i=0; i<this.tables.length; i++)
      if (nom == this.tables[i].nom)
        numtable = i;

    return numtable;
  }

  getTableParNom(nom: string)
  {
    return this.tables[this.getnumtable(nom)];
  }

  getLiens()
  {
    return this.liens;
  }


  async getData(bouticid: any, table: any, limite: any, offset: any, selcol: any, selid: any, filtres: any){
    const obj2 = { bouticid: bouticid, action:"vue-table", table:table, colonne:"", row:"", idtoup:"", limite:limite, offset:offset, selcol:selcol, selid:selid, filtres:filtres};
    return this.httpClient.post<any>( environment.apiroot + "vue-table", obj2, await this.header.buildHttpOptions());
  }

  async getRowCount(bouticid: any, table: any, selcol: any, selid: any, filtres: any){
    const obj3 = { bouticid: bouticid, action:"count-elements", table:table, colonne:"", row:"", idtoup:"", limite:"", offset:"", selcol, selid, filtres };
    return this.httpClient.post<any>( environment.apiroot + "count-elements", obj3, await this.header.buildHttpOptions());
  }

  async insertrow ( bouticid: any, table: any, row: any)
  {
    const obj = { bouticid, action:'insertrow', table, colonne:'', row };

    return this.httpClient.post<string>(environment.apiroot + 'insert-row', obj, await this.header.buildHttpOptions());

  }

  async updaterow(bouticid: any, table: any, row: any, pknom: any, idtoup: any, form: any)
  {
    const obj = { bouticid, action:'updaterow', table, colonne:pknom, row, idtoup };

    return this.httpClient.post(environment.apiroot + 'update-row', obj, await this.header.buildHttpOptions());
/*      .subscribe({ next:(v: any) => {
        this.error.next({ form, msg: null });
      }, error:(e: any) => {
        this.error.next({ form, msg: e.error.error });
      }});*/
  }

}


