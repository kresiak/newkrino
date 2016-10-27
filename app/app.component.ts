import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component({
    selector: 'giga-app',
    template: ` 
        <template ngbModalContainer></template>
        <div class="card">
            <div class="card-block">
                <h3 class="card-title">{{title}}</h3>
                <nav>
                    <a *ngFor="let menuItem of menu" class="btn btn-outline-secondary"  [class.active]="menuItem.active" (click)="activateMenu(menuItem)" routerLink="{{menuItem.route}}">{{menuItem.title}}</a>
                </nav>
                
                <router-outlet></router-outlet>    
            </div>
        </div>
    `
})
export class AppComponent {
    title = 'Krino';

    menu=[
        {
            route: '/orders',
            title: 'Orders',
            active: false
        },
        {
            route: '/suppliers',
            title: 'Suppliers',
            active: false
        },
        {
            route: '/equipes',
            title: 'Equipes',
            active: false
        },
    ];

    activateMenu(menuItem)
    {
        this.menu.forEach(element => {
            element.active= false;
        });
        menuItem.active= true;
    }
}

