import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "src/environments/environment";
import  * as myGlobals from './global';
import {async, Observable, Subscription} from "rxjs";
import {HeaderService} from "./shared/services/header.service";

@Injectable({
  providedIn: 'root'
})

export class InitSession {
  private httpClient = inject(HttpClient);
  public header = inject(HeaderService);



  static running = false;

  constructor()
  {

    this.initialize();

  }

  isInitialised()
  {
    return !this.getRunning();
  }

  getRunning()
  {
    return InitSession.running;
  }

  setRunning(state:boolean)
  {
    InitSession.running = state;
  }

  refreshsession()
  {
    setInterval(() => {
      this.upsession().then(async (prom) => {
      prom.subscribe({
        next:(data:any) => {this.header.setToken(data.token);},
        error:(err:any) => {return;}
      });})
    }, environment.refreshsessiontempo);
  }



  async upsession(): Promise<Observable<any>>
  {
    return this.httpClient.post<any>(environment.apiroot + 'session-marche', {} , await this.header.buildHttpOptions());
  }



  initialize()
  {
    if (this.isInitialised())
    {
      this.setRunning(true);
      this.upsession().then((prom) => {
        prom.subscribe({
          next:(data:any) => {
            this.header.setToken(data.token);
            this.refreshsession();
          },
          error:(err:any) => {return;}
        });

      })
    }
  }

}
