import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, ParamMap, Params, Router } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { Initialisation } from '../../initialisation';
import { ModeleService } from '../../services/model.service';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'src/app/shared/services/message.service';
import { InitSession } from 'src/app/initsession';

import { PresentationtableComponent } from '../presentationtable/presentationtable.component';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-displaytable',
    templateUrl: './displaytable.component.html',
    styleUrls: ['./displaytable.component.scss'],
    imports: [PresentationtableComponent]
})

export class DisplaytableComponent extends Initialisation {
  private route = inject(ActivatedRoute);


  table!: string;

  constructor() {
      const httpClient = inject(HttpClient);
      const lginf = inject(LogininfoService);
      const msg = inject(MessageService);
      const dialog = inject(MatDialog);
      const router = inject(Router);
      const model = inject(ModeleService);
      const activesub = inject(ActiveSubscriptionService);
      const snackBar = inject(MatSnackBar);
      const header = inject(HeaderService);

      super(httpClient, lginf, msg, model, activesub, snackBar, dialog, router,  header);
  }

  ngOnInit(): void {
    super.chargementRessources();
  }

  public override run()
  {
    this.route.params.subscribe((params: Params) => {
      this.table = params['table'];
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
    });
  }

}


