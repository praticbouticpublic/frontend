import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "src/environments/environment";
import  * as myGlobals from './global';
import { Observable, Subscription } from "rxjs";
import {HeaderService} from "./shared/services/header.service";

@Injectable({
  providedIn: 'root'
})

export class InitSession {
  private httpClient = inject(HttpClient);
  private header = inject(HeaderService);



  static running = false;

  constructor()
  {

    this.initialize();

  }

  isInitialised()
  {
    return (this.getRunning()=== false);
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
      var sobj = {

      }
      this.upsession().subscribe({
        next:(data:any) => {this.header.setToken(data.token);},
        error:(err:any) => {return;}
      });
    }, environment.refreshsessiontempo);

  }



  upsession():Observable<any>
  {
    var obj = {

    }
    return this.httpClient.post<any>(environment.apiroot + 'session-marche', obj , myGlobals.httpOptions);
  }



  initialize()
  {
    if (this.isInitialised())
    {
      this.setRunning(true);
      this.upsession().subscribe({
        next:(data:any) => {
          this.header.setToken(data.token);
          this.refreshsession();
        },
        error:(err:any) => {return;}
      });
    }
  }

}
