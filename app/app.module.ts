import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule  }   from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { HttpModule} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component'
import { HomeComponent} from './home.component'

import {SupplierListComponent} from './Suppliers/supplier-list.component';
import {SupplierDetailComponent} from './Suppliers/supplier-detail.component';
import {ProductComponent} from './Products/product.component';
import {ProductListComponent} from './Products/product-list.component';
import {ProductEnterComponent} from './Products/product-enter.component'

import {CategoryListComponent} from './Categories/category-list.component'

import {OtpComponent} from './Otps/otp.component';
import {OtpListComponent, OtpListComponentRoutable} from './Otps/otp-list.component.js';
import {OtpDetailComponent} from './Otps/otp-detail.component';

import {UserComponent} from './Users/user.component';
import {UserListComponent} from './Users/user-list.component.js';
import {EquipeDetailComponent} from './Equipes/equipe-detail.component'
import {EquipeListComponent} from './Equipes/equipe-list.component'

import {PreOrderComponent} from './Orders/pre-order.component'
import {OrderDetailComponent, OrderComponentRoutable} from './Orders/order-detail.component'
import {OrderListComponent, OrderListComponentRoutable} from './Orders/order-list.component'

import {DashboardComponent} from './Dashboard/dashboard.component'
import {DashletComponent} from './Dashboard/dashlet.component'

import {Editor} from './ui/editor/editor'
import {EditorNumber} from './ui/editor/editor-number'
import {Checkbox} from './ui/checkbox/checkbox'
import {SelectorComponent} from './ui/selector/selector.component'
import {CommentComponent} from './Comments/comment.component'
import {CommentsComponent} from './Comments/comments.component'

import {ApiService} from './Shared/Services/api.service';
import {ProductService} from './Shared/Services/product.service'
import {SupplierService} from './Shared/Services/supplier.service'
import {OrderService} from './Shared/Services/order.service'
import {DataStore} from './Shared/Services/data.service';
import {AuthService} from './Shared/Services/auth.service'
import {OtpChoiceService} from './Shared/Services/otp-choice.service'
import {UserService} from './Shared/Services/user.service'

import {MomentModule} from 'angular2-moment';

@NgModule({
  imports:      [ 
          MomentModule,
          BrowserModule, 
          FormsModule, ReactiveFormsModule,
          HttpModule,
          NgbModule.forRoot(),
          RouterModule.forRoot([
            { path: "suppliers", component: SupplierListComponent},
            { path: "equipes", component: EquipeListComponent},
            { path: "orders", component: OrderListComponentRoutable},
            { path: "categories", component: CategoryListComponent},
            { path: "otps", component: OtpListComponentRoutable},
            { path: "dashboard", component: DashboardComponent},
            { path: "home", component: HomeComponent},
            { path: "", component: HomeComponent, pathMatch: 'full'},
            { path: 'preorder/:id', component: PreOrderComponent },
            { path: 'order/:id', component: OrderComponentRoutable }
          ])
   ],
  declarations: [ AppComponent, HomeComponent, 
                  CommentComponent, CommentsComponent,
                  SupplierListComponent, SupplierDetailComponent, ProductComponent, ProductListComponent, ProductEnterComponent,
                  OtpComponent, OtpListComponent, OtpDetailComponent, OtpListComponentRoutable,
                  CategoryListComponent,
                  DashboardComponent, DashletComponent,
                  UserComponent, UserListComponent, 
                  EquipeDetailComponent, EquipeListComponent, 
                  PreOrderComponent, OrderDetailComponent, OrderComponentRoutable,
                  OrderListComponent, OrderListComponentRoutable,
                  Editor, EditorNumber, Checkbox, SelectorComponent
                 ],
  providers:    [ OtpChoiceService, ApiService, DataStore, AuthService, ProductService, SupplierService, OrderService, UserService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
