import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Crisp } from "crisp-sdk-web";
import { PushNotificationService } from './shared/services/pushnotif.service'
import {InitSession} from "./initsession";
import {HeaderService} from "./shared/services/header.service";
import {DialogComponent} from "./shared/components/dialog/dialog.component";
import {strings} from "./shared/string";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
  standalone: true
})
export class AppComponent extends InitSession implements OnInit
{
  private pushnotif = inject(PushNotificationService);
  dialog = inject(MatDialog);

  title = 'Praticboutic';
  constructor()
  {
    Crisp.configure('c21f7fea-9f56-47ca-af0c-f8978eff4c9b');
    $crisp.push(["safe", true]);
    super()
  }

  async ngOnInit()
  {
    this.pushnotif._onMessage();
    super.upsession().then(async (prom) => {
      prom.subscribe({
        next: data => {
          this.header.setToken(data.token);
        },
        error: err => {
          this.openDialog(strings.Error, err.error.error);
        }
      })

    });
  }

  openDialog(title: string, body: string) {
    this.dialog.open(DialogComponent, { data : { title: title, body: body } } );
  }

}
