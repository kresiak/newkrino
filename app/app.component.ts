import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthService } from './Shared/Services/auth.service'


@Component({
    moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router ) { }

    ngOnInit(): void {
        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event =>
            {
                var e= <NavigationEnd>event;
                var r= e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
                try{
                    this.activateMenu(this.menu.filter(menuitem => menuitem.route===r)[0]);
                }
                finally{}
            }
        );
        this.usersObservable = this.authService.getAnnotatedUsers();
        this.usersObservable.subscribe(users => {
            this.users = users;
            this.initLoginData();
        });
    }

    private initLoginData() {
        this.currentUserId = this.authService.getUserId();
        this.currentEquipeId = this.authService.getEquipeId();

        let currentUserAnnotated = this.users.filter(user => user.data._id === this.currentUserId)[0];
        this.possibleEquipes = currentUserAnnotated ? currentUserAnnotated.annotation.equipes : [];

        if (!this.possibleEquipes.map(equipe => equipe._id).includes(this.currentEquipeId) && this.possibleEquipes.length > 0)
        {
            let idToTake= this.possibleEquipes[0]._id;
            this.authService.setEquipeId(idToTake);
            this.currentEquipeId= idToTake;
        }
    }

    private usersObservable: Observable<any>;
    private users;
    private currentUserId;
    private currentEquipeId;
    private possibleEquipes: any[];

    title = 'Krino';

    menu = [
        {
            route: '/home',
            title: 'Home',
            active: false
        },
        {
            route: '/dashboard',
            title: 'Dashboard',
            active: false
        },
        {
            route: '/mykrino',
            title: 'My Krino',
            active: false
        },
        {
            route: '/orders',
            title: 'Orders',
            active: false
        },
        {
            route: '/products',
            title: 'Products',
            active: false
        },
        {
            route: '/suppliers',
            title: 'Suppliers',
            active: false
        },
        {
            route: '/stock',
            title: 'Stock',
            active: false
        },
        {
            route: '/categories',
            title: 'Categories',
            active: false
        },
        {
            route: '/equipes',
            title: 'Equipes',
            active: false
        },
        {
            route: '/otps',
            title: 'Otps',
            active: false
        },
        {
            route: '/manips',
            title: 'Manips',
            active: false
        },
        {
            route: '/prestations',
            title: 'Prestations',
            active: false
        },
        {
            route: '/admin',
            title: 'Administration',
            active: false
        }
        
        ];

    activateMenu(menuItem) {
        this.menu.forEach(element => {
            element.active = false;
        });
        if (menuItem) menuItem.active = true;
    }

    userSelected(value) {
        this.authService.setUserId(value);
        this.initLoginData();
    }

    equipeSelected(value) {
        this.authService.setEquipeId(value);
        this.initLoginData();
    }
}

