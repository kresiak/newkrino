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
import {SupplierDetailComponent} from './Suppliers/supplier-detail.component';
import {ProductComponent} from './Products/product.component';
import {ProductListComponent} from './Products/product-list.component';

import {OtpComponent} from './Otps/otp.component';
import {OtpListComponent} from './Otps/otp-list.component.js';

import {UserComponent} from './Users/user.component';
import {UserListComponent} from './Users/user-list.component.js';
import {EquipeDetailComponent} from './Equipes/equipe-detail.component'
import {EquipeListComponent} from './Equipes/equipe-list.component'

import {Editor} from './ui/editor/editor'
import {Checkbox} from './ui/checkbox/checkbox'
import {SelectorComponent} from './ui/selector/selector.component'

import {ApiService} from './Shared/Services/api.service';

@NgModule({
  imports:      [ 
          BrowserModule, 
          FormsModule,  
          HttpModule,
          NgbModule.forRoot(),
          RouterModule.forRoot([
            { path: "suppliers", component: SupplierListComponent},
            { path: "equipes", component: EquipeListComponent},
            { path: "heroes", component: HeroesComponent},
            { path: "dashboard", component: DashboardComponent},
            { path: "", component: DashboardComponent, pathMatch: 'full'},
            { path: 'detail/:id', component: HeroDetailComponent }
          ])
   ],
  declarations: [ AppComponent, SupplierListComponent, SupplierDetailComponent, ProductComponent, ProductListComponent, HeroesComponent, HeroDetailComponent, DashboardComponent,
                  OtpComponent, OtpListComponent, UserComponent, UserListComponent, EquipeDetailComponent, EquipeListComponent,
                  Editor, Checkbox, SelectorComponent
                 ],
  providers:    [ HeroService, ApiService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
