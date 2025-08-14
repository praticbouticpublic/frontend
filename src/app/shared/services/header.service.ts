import { Injectable } from '@angular/core';
import {HttpHeaders} from "@angular/common/http";
import * as globals from './../../global';

@Injectable({
  providedIn: 'root'
})

export class HeaderService {

    token:any;
    options:any;
    headeropt:any;

  constructor() {
        //this.initHttpOptions();
    }

    private async initHttpOptions() {
        //this.headeropt = this.buildHttpOptions();
    }

   getToken(useStorage :boolean = true):any {
     return useStorage ? sessionStorage.getItem('jwt_token') : this.token;
   }

    setToken( token:  any, useStorage :boolean = true) {
      this.token = token;
      if (useStorage)
         sessionStorage.setItem('jwt_token', token);
    }

    async buildHttpOptions(isUpload = false): Promise<{ headers: HttpHeaders; }> {
        const token: string = this.getToken();
        //console.log('token', token);
        let headerConfig: any = {};
        headerConfig =  {
            'Accept': 'application/json'
        };
        if (!isUpload) {
          // Pour les requêtes JSON classiques uniquement
          headerConfig['Content-Type'] = 'application/json';
        }

      if (token) {
            headerConfig['Authorization']= `Bearer ${token}`;
        }

        return {
            headers: new HttpHeaders(headerConfig)
        };

    }
}
