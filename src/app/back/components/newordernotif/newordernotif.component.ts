import { Component, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newordernotif',
  templateUrl: './newordernotif.component.html',
  styleUrls: ['./newordernotif.component.scss']
})
export class NewordernotifComponent {
  private router = inject(Router);


  snackBarRef = inject(MatSnackBarRef);

  gotoOrdersList() 
  {
    this.router.navigate(['/admin/backoffice/tabs/orders/displaytable/commande']);
  }
}
