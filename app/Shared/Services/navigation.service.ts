import { Injectable, Inject } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'


@Injectable()
export class NavigationService {

    constructor(private router: Router) { }

    maximizeOrUnmaximize(urlPath: string, id: string, currentPath: string, lastPath: string) {
        if (!lastPath) {
            let link = [urlPath, id];
            let navigationExtras: NavigationExtras = {
                queryParams: { 'path': currentPath }
            }
            this.router.navigate(link, navigationExtras);
        }
        else {
            let link = ['/unmaximize'];
            let navigationExtras: NavigationExtras = {
                queryParams: { 'path': lastPath }
            }
            this.router.navigate(link, navigationExtras);
        }
    }

}