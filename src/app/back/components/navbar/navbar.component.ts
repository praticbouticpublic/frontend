import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { ModeleService } from '../../services/model.service';
import { environment } from 'src/environments/environment';
import { PushNotificationService } from 'src/app/shared/services/pushnotif.service';
import { MatNavList, MatListItem } from '@angular/material/list';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [MatNavList, MatListItem, RouterLink, RouterLinkActive, RouterOutlet]
})
export class NavbarComponent {
  private router = inject(Router);
  private lginf = inject(LogininfoService);
  private model = inject(ModeleService);
  private pushnotif = inject(PushNotificationService);


  identifiant!:string;
  menushown = true;
  menuwidth = '0vw';
  token ='';
  prod = environment.production;

  ngOnInit()
  {
    this.identifiant = this.lginf.getIdentifiant();
    this.initswipe();
    this.pushnotif._getDeviceToken().then(token => {
      this.token = token;
    });
  }

  openSidebar() 
  {
    this.menuwidth = '100vw';
  }
  
  closeSidebar() 
  {
    this.menuwidth = '0vw';
  }
  
  getSidebarStatus()
  {
    var sbwidth = this.menuwidth;
    if (this.menuwidth === '100vw')
    {
      return 'open';
    }
    else if (this.menuwidth === '0vw')
    {
      return 'close';
    }
    else {
      return 'moving';
    }

  }
  
  initswipe()
  {
    var startX = 0; // Position de départ
    var distance = 100; // 100 px de swipe pour afficher le menu
  
    // Au premier point de contact
    window.addEventListener("touchstart", (evt)=> {
      var tag = (evt.targetTouches[0].target as HTMLElement).tagName;
      //console.log("touchstart");
      //console.log(tag);
      if ((tag == "TABLE") || (tag == "TR") || (tag == "TD") || (tag == "TBODY") || (tag == "THEAD") || (tag == "TH"))
        return;
      if (tag == "INPUT")
      {
        var type = (evt.targetTouches[0].target as HTMLInputElement).type;
        if (type == "checkbox")
          return;
      }
      // Récupère les "touches" effectuées
      var touches = evt.changedTouches[0];
      startX = touches.pageX;
      let between = 0;
    }, false);
  
    // Quand les points de contact sont en mouvement
    window.addEventListener("touchmove", (evt) => {
      // Limite les effets de bord avec le tactile...
      var tag = (evt.targetTouches[0].target as HTMLElement).tagName;
      //console.log("touchmove");
      //console.log(tag);
      if ((tag == "TABLE") || (tag == "TR") || (tag == "TD") || (tag == "TBODY") || (tag == "THEAD") || (tag == "TH"))
        return;
      if (tag == "INPUT")
      {
        var type = (evt.targetTouches[0].target as HTMLInputElement).type;
        if (type == "checkbox")
          return;
      }
      evt.preventDefault();
      evt.stopPropagation();
    }, false);
  
    // Quand le contact s'arrête
    window.addEventListener("touchend", (evt) => {
      var touches = evt.changedTouches[0];
      var between = touches.pageX - startX;
      //console.log("touchend");
      //console.log(between);
      var tag = (touches.target as HTMLInputElement).tagName;
      //console.log(tag);
      if ((tag == "TABLE") || (tag == "TR") || (tag == "TD") || (tag == "TBODY") || (tag == "THEAD") || (tag == "TH"))
        return;
      if (tag == "INPUT")
      {
        var type = (touches.target as HTMLInputElement).type;
        if (type == "checkbox")
          return;
      }
      // Détection de la direction
      if(between > 0) {
        var orientation = "ltr";
      } else {
        var orientation = "rtl";
      }
  
      // Créé l'effet pour le menu slide (compatible partout)
      if(Math.abs(between) >= distance && orientation == "ltr" && this.getSidebarStatus() == 'close') 
      {
        this.openSidebar();
      }
      if(Math.abs(between) >= distance && orientation == "rtl" && this.getSidebarStatus() == 'open') 
      {
        this.closeSidebar();
      }
    }, false);
  }

  bakRubrique($event: Event)
  {
    localStorage.setItem('lasttab_' + this.lginf.getBouticId(), '');
  }


}
