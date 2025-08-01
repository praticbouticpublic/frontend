import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as myGlobals from 'src/app/global';

@Injectable({
  providedIn: 'root'
})
export class DbacessService {
  httpClient = inject(HttpClient);


  getBoutics(){
    const pGetBoutics = { action:"listcustomer" };
    return this.httpClient.post<any>( environment.apiroot + 'genquery', pGetBoutics, myGlobals.httpOptions);
  }

}
