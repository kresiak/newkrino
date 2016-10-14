import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { HttpModule} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HeroesComponent }   from './heroes.component';
import { DashboardComponent} from './dashboard.component';
import { HeroDetailComponent }   from './hero-detail.component';
import { HeroService} from './hero.service';

import {SupplierListComponent} from './Suppliers/supplier-list.component';
import {ApiService} from './Shared/Services/api.service';

@NgModule({
  imports:      [ 
          BrowserModule, 
          FormsModule,
          HttpModule,
          NgbModule.forRoot(),
          RouterModule.forRoot([
            { path: "suppliers", component: SupplierListComponent},
            { path: "heroes", component: HeroesComponent},
            { path: "dashboard", component: DashboardComponent},
            { path: "", component: DashboardComponent, pathMatch: 'full'},
            { path: 'detail/:id', component: HeroDetailComponent }
          ])
   ],
  declarations: [ AppComponent, SupplierListComponent, HeroesComponent, HeroDetailComponent, DashboardComponent ],
  providers:    [ HeroService, ApiService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
