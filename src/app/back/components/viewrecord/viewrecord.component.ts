import { Component, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModeleService } from '../../services/model.service';
import { Initialisation } from '../../initialisation';
import { HttpClient } from '@angular/common/http';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'src/app/shared/services/message.service';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { PresentationrecordComponent } from '../presentationrecord/presentationrecord.component';
import { PresentationtableComponent } from '../presentationtable/presentationtable.component';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-viewrecord',
    templateUrl: './viewrecord.component.html',
    styleUrls: ['./viewrecord.component.scss'],
    imports: [PresentationrecordComponent, PresentationtableComponent]
})
export class ViewrecordComponent extends Initialisation {
  private route = inject(ActivatedRoute);

  table!: string;
  idtoup!: number;
  selcol!: string;
  selid!: number;
  numtable: any;
  latable: any;
  sstable: any;
  sstablenom: any;
  sstableid: any;
  id: any;
  sstablefld: any;

  constructor() {
    const httpClient = inject(HttpClient);
    const activesub = inject(ActiveSubscriptionService);
    const snackbar = inject(MatSnackBar);
    const router = inject(Router);
    const model = inject(ModeleService);
    const lginf = inject(LogininfoService);
    const dialog = inject(MatDialog);
    const msg = inject(MessageService);
    const header = inject(HeaderService);

    super(httpClient, lginf, msg, model, activesub, snackbar, dialog, router, header);
  }

  ngOnInit(): void {
    super.chargementRessources();
  }

  override run(): void {
    this.route.params.subscribe((params: Params) => {
      this.table = params['table'];
      this.idtoup = params['idtoup'];
      this.selcol = params['selcol'];
      this.selid = params['selid'];
      this.numtable = this.model.getnumtable(this.table);
      this.latable = this.model.getTable(this.numtable);
      this.sstable = this.model.getTableParNom(this.table).sstable;
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
    })
  }

}
