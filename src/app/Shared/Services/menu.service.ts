import { Injectable, Inject } from '@angular/core'
import { AuthenticationStatusInfo, AuthService } from './auth.service'
import { ActivatedRoute, Params, Router, NavigationEnd  } from '@angular/router'
import { Observable, Subscription, ReplaySubject } from 'rxjs/Rx'


Injectable()
export class MenuService {
    constructor( @Inject(AuthService) private authService: AuthService, private router: Router) { 

    }

    private menu: any[] 
    private menuSubject: ReplaySubject<any[]> = new ReplaySubject(1)

    private emitCurrentMenu() {
        this.menuSubject.next(this.menu)
    }


    initializeMenus() {
        Observable.combineLatest(this.router.events.filter(event => event instanceof NavigationEnd), this.authService.getStatusObservable(), (event, statusInfo) => {
            this.initMenu(statusInfo)
            return event
        }).subscribe(event => {
            var e = <NavigationEnd>event;
            var r = e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
            try {
                this.activateMenu(this.menu.filter(menuitem => menuitem.route === r || r.startsWith(menuitem.route + '?'))[0]);
                if (this.menu.filter(m=>m.active).length===0){
                    ['order','otp','equipe','product','user','category','supplier','sap'].filter(objType => r.startsWith('/' + objType + '/')).forEach(objType =>{
                        this.menu.push({
                            title: 'Detail ' + objType,
                            active: true
                        })
                    })
                }
            }
            catch(e) {
            }
            finally { 

            }
            this.emitCurrentMenu()
        });        
    }

    getMenuObservable(): Observable<any[]> {
        return this.menuSubject
    }

    private initMenu(statusInfo: AuthenticationStatusInfo) {
        var isLoggedIn: boolean = statusInfo && statusInfo.isLoggedIn        
        this.menu = [
            {
                route: '/home',
                title: 'Home',
                active: false
            },
            {
                route: '/dashboard',
                title: 'Dashboard',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/mykrino',
                title: 'My Krino',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/orders',
                title: 'Orders',
                active: false
            },
            {
                route: '/products',
                title: 'Products',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/suppliers',
                title: 'Suppliers',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/stock',
                title: 'Stock',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/categories',
                title: 'Categories',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/equipes',
                title: 'Equipes',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/users',
                title: 'Users',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/otps',
                title: 'Otps',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/saps',
                title: 'Sap',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/admin',
                title: 'Administration',
                active: false,
                hide: !isLoggedIn || !statusInfo.isAdministrator()
            },
            {
                route: '/reception',
                title: 'Reception',
                active: false,
                hide: false
            },
            {
                route: '/communication',
                title: 'Communication',
                active: false,
                hide: !isLoggedIn
            }
        ];
        this.menu = this.menu.filter(item => !item.hide)
    }

    private activateMenu(menuItem) {
        this.menu.forEach(element => {
            element.active = false;
        });
        if (menuItem) menuItem.active = true;
    }


}


