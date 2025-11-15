import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { LogininfoService } from "src/app/shared/services/logininfo.service";
import { environment } from "src/environments/environment";
import * as myGlobals from './../../global';
import {HeaderService} from "./header.service";

@Injectable({
  providedIn: 'root'
})

export class ActiveSubscriptionService {
  private lginf = inject(LogininfoService);
  private httpClient = inject(HttpClient);
  public header = inject(HeaderService);

  async isActive(): Promise<Observable<string>>
  {
    const postData = {
      stripecustomerid: this.lginf.getStripecustomerid()
    };

    return this.httpClient.post<string>(environment.apiroot + 'check-subscription', postData, await this.header.buildHttpOptions());

  }
}
