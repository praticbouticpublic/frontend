import { Component, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Initialisation } from '../../initialisation';
import { HttpClient } from '@angular/common/http';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ModeleService } from '../../services/model.service';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PresentationrecordComponent } from '../presentationrecord/presentationrecord.component';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-insertrecord',
    templateUrl: './insertrecord.component.html',
    styleUrls: ['./insertrecord.component.scss'],
    imports: [PresentationrecordComponent]
})
export class InsertrecordComponent extends Initialisation {
  private route = inject(ActivatedRoute);

  table!: string;
  selcol!: string;
  selid!: number;

  constructor() {
    const httpClient = inject(HttpClient);
    const lginf = inject(LogininfoService);
    const msg = inject(MessageService);
    const model = inject(ModeleService);
    const activesub = inject(ActiveSubscriptionService);
    const snackBar = inject(MatSnackBar);
    const dialog = inject(MatDialog);
    const router = inject(Router);
    const header = inject(HeaderService);

    super(httpClient, lginf, msg, model, activesub, snackBar, dialog, router, header);

  }

  ngOnInit(): void {
    super.chargementRessources();
  }

  override run()
  {
    this.route.params.subscribe((params: Params) => {
      this.table = params['table'];
      this.selcol = params['selcol'];
      this.selid = params['selid'];
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
    })

  }
}
