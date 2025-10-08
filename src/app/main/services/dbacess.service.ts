import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as myGlobals from 'src/app/global';
import {HeaderService} from "../../shared/services/header.service";

@Injectable({
  providedIn: 'root'
})
export class DbacessService {
  httpClient = inject(HttpClient);
  header =inject(HeaderService);


  async getBoutics(){
    const pGetBoutics = { action:"listcustomer" };
    return this.httpClient.post<any>( environment.apiroot + 'genquery', pGetBoutics, myGlobals.httpOptions);
  }

}
