import { Injectable, Inject } from '@angular/core'
import { AuthenticationStatusInfo, AuthService } from './auth.service'
import { NotificationService } from './notification.service'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import { DataStore } from './data.service'
import { Observable, Subscription, ReplaySubject } from 'rxjs/Rx'


Injectable()
export class MenuService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService, private router: Router
        , @Inject(NotificationService) private notificationService: NotificationService) {

    }

    private menu: any[]
    private statusInfo: AuthenticationStatusInfo
    private menuSubject: ReplaySubject<any[]> = new ReplaySubject(1)

    private emitCurrentMenu() {
        this.menuSubject.next(this.menu)
    }

    loginSideEffectObservable(): Observable<any> {
        return Observable.combineLatest(this.authService.getStatusObservable(), this.dataStore.getLaboNameObservable(), (statusInfo, laboName) => {
            return {
                statusInfo: statusInfo,
                laboName: laboName
            }
        }).do(info => {
            this.statusInfo = info.statusInfo
            this.initMenuBasedOnLoginUser(this.statusInfo, info.laboName)
            this.emitCurrentMenu()
        }).switchMap(notImportant => {
            return this.notificationService.getLmWarningMessages().map(messagesObj => messagesObj.finishingOtps.length).distinctUntilChanged()
        }).do(nbFinishingOtp => {
            if (this.statusInfo && this.statusInfo.isAdministrator()) {
                var item = this.menu.filter(menuitem => menuitem.route === '/dashboard')[0]
                if (item) {
                    item.isAttractAttentionMode = nbFinishingOtp 
                    item.attractAttentionModeText = nbFinishingOtp ? 'There are expiring otps' : ''
                    this.emitCurrentMenu()
                }
            }
        })
    }

    initializeMenus() {
        Observable.combineLatest(this.router.events.filter(event => event instanceof NavigationEnd), this.loginSideEffectObservable(),
            ((event, nothing) => {
                this.updateMenuBasedOnUrl(event)
                this.emitCurrentMenu()
            }))
            .subscribe(() => { });
    }

    getMenuObservable(): Observable<any[]> {
        return this.menuSubject
    }

    private updateMenuBasedOnUrl(event) {
        var e = <NavigationEnd>event;
        var r = e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
        try {
            this.activateMenu(this.menu.filter(menuitem => menuitem.route === r || r.startsWith(menuitem.route + '?'))[0]);
            if (this.menu.filter(m => m.active).length === 0) {
                ['order', 'otp', 'equipe', 'product', 'user', 'category', 'supplier', 'sap'].filter(objType => r.startsWith('/' + objType + '/')).forEach(objType => {
                    this.menu.push({
                        title: 'Detail ' + objType,
                        active: true,
                        temporary: true
                    })
                })
            }
        }
        catch (e) {
        }
        finally {

        }
    }

    private initMenuBasedOnLoginUser(statusInfo: AuthenticationStatusInfo, laboName: string) {
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
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/mykrino',
                title: 'My Krino',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/orders',
                title: 'Orders',
                active: false,
                hide: !laboName
            },
            {
                route: '/products',
                title: 'Products',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/suppliers',
                title: 'Suppliers',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/stock',
                title: 'Stock',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/categories',
                title: 'Categories',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/equipes',
                title: 'Equipes',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/users',
                title: 'Users',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/otps',
                title: 'Otps',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
            },
            {
                route: '/saps',
                title: 'Sap',
                active: false,
                hide: !isLoggedIn || statusInfo.isGroupOrdersUser()
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
                hide: statusInfo.isGroupOrdersUser()
            },
            {
                route: '/communication',
                title: 'Communication',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/platform',
                title: 'Platform',
                active: false,
                hide: !isLoggedIn || !statusInfo.isPlatformAdminstrator()
            }
        ];
        this.menu = this.menu.filter(item => !item.hide)
    }

    private activateMenu(menuItem) {
        this.menu = this.menu.filter(item => !item.temporary)

        if (menuItem && menuItem.isAttractAttentionMode) {
            delete menuItem.isAttractAttentionMode
            delete menuItem.attractAttentionModeText
        }
        this.menu.forEach(element => {
            element.active = false;
        });
        if (menuItem) menuItem.active = true;
    }


}


