import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { ActiveSubscriptionService } from "../../shared/services/activesubscription.service";


export const ActiveSubscriptionGuard = () => {
    const activesub = inject(ActiveSubscriptionService);
    const router = inject(Router);

    activesub.isActive().then(observable =>{
      observable.subscribe({
        next:(data:any) => {
          if (data.result === 'OK')
          {
            return true;
          }
          else
          {
            router.navigate(['admin/subscription']);
            return false;
          }
        }, error:(err:any) => {
          return false;
        }
      });
    })



}
