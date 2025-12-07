import { Component } from '@angular/core';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-customerarea',
    templateUrl: './customerarea.component.html',
    styleUrls: ['./customerarea.component.scss'],
    imports: [MatTabNav, MatTabLink, RouterLink, MatTabNavPanel, RouterOutlet]
})
export class CustomerareaComponent {
activeLink = 1;
}
