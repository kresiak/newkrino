import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component({
    selector: 'giga-app',
    template: ` 
        <h1>{{title}}</h1>
        <nav>
            <a routerLink="/dashboard">Dashboard</a>
            <a routerLink="/heroes">Heroes</a>
            <a routerLink="/suppliers">Suppliers</a>
        </nav>
        
        <router-outlet></router-outlet>    
    `
})
export class AppComponent {
    title = 'Fournisseurs';
}

