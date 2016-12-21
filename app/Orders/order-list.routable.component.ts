import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './order-list.routable.component.html'        
    }
)
export class OrderListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService) { }

    ngOnInit(): void {
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
        this.ordersObservable = this.orderService.getNewestAnnotedOrders(1200);
    }

    private suppliersObservable: Observable<any>;
    private ordersObservable: Observable<any>;
}