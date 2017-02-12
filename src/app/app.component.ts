import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthenticationStatusInfo, AuthService } from './Shared/Services/auth.service'
import { ProductService } from './Shared/Services/product.service'
import { WebSocketService } from './Shared/Services/websocket.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"


@Component({
    //moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private productService: ProductService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private webSocketService: WebSocketService, private _sanitizer: DomSanitizer) {
        this.webSocketService.init()
        this.authService.initFromLocalStorage()
    }

    private subscriptionAuthorization: Subscription 
    private subscriptionBasketItems: Subscription 


    private password: string = ''
    //private users;
    private usersShort: any[];
    private possibleEquipes: any[];
    private authorizationStatusInfo: AuthenticationStatusInfo
    private initializingUser: boolean= false
    private initializingEquipe: boolean= false
    private menu

    private userValue
    private equipeValue

    private nbProductsInBasket: number = 0

    ngOnInit(): void {
/*        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            var e = <NavigationEnd>event;
            var r = e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
            try {
                this.activateMenu(this.menu.filter(menuitem => menuitem.route === r)[0]);
            }
            finally { }
        });
*/

        this.subscriptionBasketItems= this.productService.getBasketItemsForCurrentUser().subscribe(items => {
            this.nbProductsInBasket= items.length
        })

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.initializingUser= true
            this.initializingEquipe= true
            this.authorizationStatusInfo = statusInfo
            this.usersShort = statusInfo.annotatedUserList.map(user => {
                return {
                    id: user.data._id,
                    value: user.annotation.fullName
                }
            })

            this.userValue= this.usersShort.filter(user => user.id === statusInfo.currentUserId)[0]

            this.possibleEquipes = !statusInfo.equipeList ? [] : statusInfo.equipeList.map(eq => {
                    return {
                        id: eq._id,
                        value: eq.name
                    }
                })

            this.equipeValue= this.possibleEquipes.filter(eq => eq.id === statusInfo.currentEquipeId)[0]

            this.initMenu(statusInfo)
        })
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionBasketItems.unsubscribe()
    }
    

    openModal(template) {
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "sm" });
        var promise = ref.result;
        promise.then((res) => {
            this.passwordSave();
        }, (res) => {
            this.passwordCancel();
        });
        promise.catch((err) => {
            this.passwordCancel();
        });
    }

    private passwordSave() {
        this.authService.tryLogin(this.password)
    }

    private passwordCancel() {
    }

    userSelected(value) {
        if (!value) value = ''
        if (value.id) {
            this.authService.setUserId(value.id);
        }
        else {
            this.authService.setUserId('');
        }
    }

    equipeSelected(value) {
        if (!value) value = ''
        if (value.id) {
            this.authService.setEquipeId(value.id);
        }
        else {
            this.authService.setEquipeId('');
        }
    }


    title = 'Krino';

    initMenu(statusInfo: AuthenticationStatusInfo) {
        var isLoggedIn: boolean = statusInfo.isLoggedIn
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
                route: '/manips',
                title: 'Manips',
                active: false,
                hide: true
            },
            {
                route: '/prestations',
                title: 'Prestations',
                active: false,
                hide: true
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


    activateMenu(menuItem) {
        this.menu.forEach(element => {
            element.active = false;
        });
        if (menuItem) menuItem.active = true;
    }

    autocompleListFormatter = (data: any): SafeHtml => {
        let html = `<span>${data.value}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    };

    navigateToBasket() {
        let link = ['/basket'];
        this.router.navigate(link);
    }
    

}

