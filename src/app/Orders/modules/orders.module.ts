import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from 'ng2-translate'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { UiModule } from'../../ui/modules/ui.module'
import { CommentsModule } from'../../Comments/modules/comments.module'

import { OrderDetailComponent } from '../order-detail.component'
import { OrderListComponent } from '../order-list.component'

@NgModule({
  imports: [
    NgbModule, CommonModule, TranslateModule,
    FormsModule, ReactiveFormsModule, UiModule, CommentsModule
  ],
  declarations: [
      OrderDetailComponent, OrderListComponent, 
  ],
  exports: [
      OrderDetailComponent, OrderListComponent, 
  ],
  providers: [
    ],
  bootstrap: []
})
export class OrdersModule { }

