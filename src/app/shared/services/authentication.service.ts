import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subscription, catchError, map, of, tap } from 'rxjs';
import { Logininfo } from '../models/logininfo';
import { LogininfoService } from './logininfo.service';
import {HeaderService} from "./header.service";


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private httpClient = inject(HttpClient);
  private lginf = inject(LogininfoService);
  private header = inject(HeaderService);

  ngOnInit()
  {
  }

  async processLogin(login: string, password: string): Promise<Observable<Logininfo>>
  {

    const postData = {
      email: login,
      password: password
    };

    return this.httpClient.post<any>(environment.apiroot + 'authorize', postData, await this.header.buildHttpOptions())
      .pipe(map(data => {
        this.header.setToken(data.token);
        this.lginf.setLoginInfo(+data.bouticid, data.customer, postData.email, postData.password, data.stripecustomerid);
        return this.lginf.getLoginInfo();
      }));
  }

  async processGoogleLogin(login: string): Promise<Observable<Logininfo>>
  {

    const postData = {
      email: login
    };

    return this.httpClient.post<any>(environment.apiroot + 'google-signin', postData, await this.header.buildHttpOptions())
      .pipe(map(data => {
        this.header.setToken(data.token);
        if (data && data.status === "OK")
        {
          this.lginf.setLoginInfo(+data.bouticid, data.customer, postData.email, data.password, data.stripecustomerid);
        }
        else
        {
          this.lginf.setLoginInfo(0, '', postData.email, '', '');
        }
        return this.lginf.getLoginInfo();
      }));
  }

}

