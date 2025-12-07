import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { LogininfoService } from "src/app/shared/services/logininfo.service";


export const IdentifiedGuard = () => {
    const lginf = inject(LogininfoService);
    const router = inject(Router);
    if ((lginf.getBouticId() === null) || (lginf.getBouticId() === undefined) ||(lginf.getBouticId() === 0))
    {
      router.navigate(['admin/exit']);
      return false;
    }
    else
    {
      return true;
    }
}
