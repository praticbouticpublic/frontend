import { Injectable } from '@angular/core';
import { TypeMethod } from '../enum/typemethod.enum';

@Injectable({
  providedIn: 'root'
})
export class SessionfrontService {
  bouticid = 0;
  logo = '';
  aliasboutic = '';
  method = 0;
  mailstatus = '';
  table = 0;
  nomboutic = '';

  constructor() { }

  getBouticId(useStorage:boolean = true): number
  {
    return (useStorage ? +(sessionStorage.getItem('bouticid') as string) : this.bouticid);
  }

  setBouticId(id:number)
  {
    sessionStorage.setItem('bouticid', String(id));
    this.bouticid = id;
  }

  getLogo(useStorage:boolean = true) : string
  {
    return (useStorage ? sessionStorage.getItem('logo') as string : this.logo);
  }

  setLogo(filename: string)
  {
    sessionStorage.setItem('logo', filename);
    this.logo = filename;
  }

  getAliasBoutic(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('aliasboutic') as string : this.aliasboutic);
  }

  setAliasBoutic(nom: string)
  {
    sessionStorage.setItem('aliasboutic', nom);
    this.aliasboutic = nom;
  }

  getMethod(useStorage:boolean = true) : TypeMethod
  {
    return (useStorage ? +(sessionStorage.getItem('method') as string) : this.method);
  }

  setMethod(no: number)
  {
    sessionStorage.setItem('method', String(no));
    this.method = no;
  }

  setTable(no: number)
  {
    sessionStorage.setItem('table', String(no));
    this.table = no;
  }

  getTable(useStorage:boolean = true) : number
  {
    return (useStorage ? +(sessionStorage.getItem('table') as string) : this.table);
  }

  setNomBoutic(str: string)
  {
    sessionStorage.setItem('nomboutic', str);
    this.nomboutic = str;
  }

  getNomBoutic(useStorage:boolean = true) : string
  {
    return (useStorage ? (sessionStorage.getItem('nomboutic') as string) : this.nomboutic);
  }

  razSessionFront()
  {
    sessionStorage.removeItem('bouticid');
    sessionStorage.removeItem('logo');
    sessionStorage.removeItem('aliasboutic');
    sessionStorage.removeItem('method');
    sessionStorage.removeItem('table');
    sessionStorage.removeItem('nomboutic');
  }

}
