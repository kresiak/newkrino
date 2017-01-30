import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthenticationStatusInfo, AuthService } from './Shared/Services/auth.service'


@Component({
    moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal) { }

    private password: string = ''
    private users;
    private possibleEquipes: any[];
    private authorizationStatusInfo: AuthenticationStatusInfo
    private menu

    ngOnInit(): void {
        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            var e = <NavigationEnd>event;
            var r = e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
            try {
                this.activateMenu(this.menu.filter(menuitem => menuitem.route === r)[0]);
            }
            finally { }
        }
        );
        this.authService.getAnnotatedUsers().subscribe(users => {
            this.users = users;
            this.authService.getStatusObservable().subscribe(statusInfo => {
                this.authorizationStatusInfo = statusInfo
                let currentUserAnnotated = this.users.filter(user => user.data._id === statusInfo.currentUserId)[0];
                this.possibleEquipes = currentUserAnnotated ? currentUserAnnotated.annotation.equipes : [];
                this.initMenu(statusInfo)
            })
        });
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
        this.authService.setUserId(value);
    }

    equipeSelected(value) {
        this.authService.setEquipeId(value);
    }


    title = 'Krino';

    initMenu(statusInfo: AuthenticationStatusInfo) {
        var isLoggedIn: boolean= statusInfo.isLoggedIn
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
            }
        ];
        this.menu= this.menu.filter(item => !item.hide)
    }


    activateMenu(menuItem) {
        this.menu.forEach(element => {
            element.active = false;
        });
        if (menuItem) menuItem.active = true;
    }

}

