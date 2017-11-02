import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from 'ng2-translate'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { ProductListHelpComponent } from '../product-list-help.component';
import { ProductGridComponent } from '../product-grid.component';
/*import { ProductGridBasketComponent } from '../product-grid-basket.component';*/
import { ProductListComponent } from '../product-list.component';
import { ProductEnterComponent } from '../product-enter.component'
import { ProductDetailComponent } from '../product-detail.component'
import { ProductFridgeOrderButtonComponent } from '../product-fridge-order-button.component'

import { UiModule } from'../../ui/modules/ui.module'
import { CommentsModule } from'../../Comments/modules/comments.module'
import { OrdersModule } from'../../Orders/modules/orders.module'


@NgModule({
  imports: [
    NgbModule, CommonModule, TranslateModule,
    FormsModule, ReactiveFormsModule, UiModule, CommentsModule, OrdersModule
  ],
  declarations: [
    ProductGridComponent,  ProductEnterComponent, ProductListComponent, ProductDetailComponent, 
    ProductFridgeOrderButtonComponent, ProductListHelpComponent, 
    //ProductGridBasketComponent,
  ],
  exports: [
    ProductGridComponent, ProductEnterComponent, ProductListComponent, ProductDetailComponent, 
    ProductFridgeOrderButtonComponent, ProductListHelpComponent
    //ProductGridBasketComponent, 
  ],
  providers: [
    ],
  bootstrap: []
})
export class ProductsModule { }

