import { Component, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModeleService } from '../../services/model.service';
import { Initialisation } from '../../initialisation';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ActiveSubscriptionService } from 'src/app/shared/services/activesubscription.service'
import { PresentationrecordComponent } from '../presentationrecord/presentationrecord.component';

import { PresentationtableComponent } from '../presentationtable/presentationtable.component';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-updaterecord',
    templateUrl: './updaterecord.component.html',
    styleUrls: ['./updaterecord.component.scss'],
    imports: [PresentationrecordComponent, PresentationtableComponent]
})
export class UpdaterecordComponent extends Initialisation {
  private route = inject(ActivatedRoute);

  table!: string;
  idtoup!: number;
  selcol!: string;
  selid!: number;
  latable: any;
  sstablenom = '';
  sstablefld = '';
  sstableid = 0;
  sstable: any;
  numtable: any;


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

  public override run()
  {
    this.route.params.subscribe((params: Params) => {
      this.table = params['table'];
      this.idtoup = params['idtoup'];
      this.selcol = params['selcol'];
      this.selid = params['selid'];
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
      this.numtable = this.model.getnumtable(this.table);
      this.latable = this.model.getTable(this.numtable);
      this.sstable = this.model.getTableParNom(this.table).sstable;
      if (this.sstable ==='o')
      {
        let numlnk: any;
        for (let i=0; i<this.model.getLiens().length; i++ )
        {
          if (this.model.getLiens()[i].nom === this.table)
          {
            numlnk = i;
          }
        }
        for (const tbl of this.model.getTables())
        {
          if (this.model.getLiens()[numlnk].srctbl === tbl.nom)
          {
            this.sstablenom = tbl.nom ;
            this.sstableid = this.idtoup;
            this.sstablefld = this.model.getLiens()[numlnk].srcfld;
          }
        }
      }
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
    });
  }
}
