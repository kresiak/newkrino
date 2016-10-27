import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { HttpModule} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';

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

import {PreOrderComponent} from './Orders/pre-order.component'
import {OrderDetailComponent, OrderComponentRoutable} from './Orders/order-detail.component'
import {OrderListComponent, OrderListComponentRoutable} from './Orders/order-list.component'

import {Editor} from './ui/editor/editor'
import {EditorNumber} from './ui/editor/editor-number'
import {Checkbox} from './ui/checkbox/checkbox'
import {SelectorComponent} from './ui/selector/selector.component'

import {ApiService} from './Shared/Services/api.service';
import {ProductService} from './Shared/Services/product.service'
import {SupplierService} from './Shared/Services/supplier.service'
import {OrderService} from './Shared/Services/order.service'
import {DataStore} from './Shared/Services/data.service';
import {AuthService} from './Shared/Services/auth.service'

@NgModule({
  imports:      [ 
          BrowserModule, 
          FormsModule,  
          HttpModule,
          NgbModule.forRoot(),
          RouterModule.forRoot([
            { path: "suppliers", component: SupplierListComponent},
            { path: "equipes", component: EquipeListComponent},
            { path: "orders", component: OrderListComponentRoutable},
            { path: "", component: SupplierListComponent, pathMatch: 'full'},
            { path: 'preorder/:id', component: PreOrderComponent },
            { path: 'order/:id', component: OrderComponentRoutable }
          ])
   ],
  declarations: [ AppComponent, SupplierListComponent, SupplierDetailComponent, ProductComponent, ProductListComponent,
                  OtpComponent, OtpListComponent, UserComponent, UserListComponent, EquipeDetailComponent, EquipeListComponent, PreOrderComponent, OrderDetailComponent, OrderComponentRoutable,
                  OrderListComponent, OrderListComponentRoutable,
                  Editor, EditorNumber, Checkbox, SelectorComponent
                 ],
  providers:    [ ApiService, DataStore, AuthService, ProductService, SupplierService, OrderService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
