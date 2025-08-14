import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { Crisp } from "crisp-sdk-web";
import { InitSession } from './initsession';
import { HttpClient } from '@angular/common/http';
import { PushNotificationService } from './shared/services/pushnotif.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet]
})
export class AppComponent extends InitSession
{
  private pushnotif = inject(PushNotificationService);

  title = 'Praticboutic';
  constructor()
  {
    Crisp.configure('c21f7fea-9f56-47ca-af0c-f8978eff4c9b');
    $crisp.push(["safe", true]);
    super();

  }

  ngOnInit()
  {
    this.pushnotif._onMessage();
  }

}
