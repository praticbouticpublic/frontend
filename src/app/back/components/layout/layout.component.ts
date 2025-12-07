import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Initialisation } from '../../initialisation';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActiveSubscriptionService } from 'src/app/shared/services/activesubscription.service';
import { LogininfoService } from 'src/app/shared/services/logininfo.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ModeleService } from '../../services/model.service';
import { NavbarComponent } from '../navbar/navbar.component';
import {HeaderService} from "../../../shared/services/header.service";

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    imports: [NavbarComponent]
})
export class LayoutComponent extends Initialisation {
  private route = inject(ActivatedRoute);



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


      super(httpClient, lginf, msg, model, activesub, snackBar, dialog, router, header);
  }

  ngOnInit()
  {
    this.lginf.setLogged(true);
    super.chargementRessources();
    //localStorage.setItem('lasttab_' + this.lginf.getBouticId(), String(-1));
  }

  public override run()
  {
    let lasturl = localStorage.getItem('lasturl_' + this.lginf.getBouticId()) ?? '';
    //if (lasturl === '')
      this.router.navigate(['admin/backoffice/tabs/products/displaytable/article']);
    //else
    //  this.router.navigate([lasturl]);
  }

}
