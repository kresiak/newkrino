import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthenticationStatusInfo, AuthService } from './Shared/Services/auth.service'
import { WebSocketService } from './Shared/Services/websocket.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"


@Component({
    //moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private webSocketService: WebSocketService, private _sanitizer: DomSanitizer) {
        this.webSocketService.init()
        this.authService.initFromLocalStorage()
    }

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

        this.authService.getStatusObservable().subscribe(statusInfo => {
            console.log('getStatusObservable ' + statusInfo.annotatedUserList.length)
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
            console.log('info user' + this.usersShort.length + ' / ' + statusInfo.currentUserId )
            console.log('info equipe ' + statusInfo.equipeList.length + ' / ' + statusInfo.currentEquipeId + ' / ' + JSON.stringify(this.equipeValue))

            this.initMenu(statusInfo)
        })
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
/*        console.log('entering user selected: ' + value)
        if (this.initializingUser) {
            this.initializingUser= false
            return
        }
*/        console.log('user selected: ' + JSON.stringify(value))
        if (!value) value = ''
        if (value.id) {
            this.authService.setUserId(value.id);
        }
        else {
            this.authService.setUserId('');
        }
    }

    equipeSelected(value) {
/*        if (this.initializingEquipe) {
            this.initializingEquipe= false
            return
        }
*/        console.log('equipe selected: ' +  JSON.stringify(value))
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


}

