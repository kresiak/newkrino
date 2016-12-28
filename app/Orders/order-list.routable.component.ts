import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable } from 'rxjs/Rx'
import { NavigationService } from '../Shared/Services/navigation.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './order-list.routable.component.html'        
    }
)
export class OrderListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService, private navigationService: NavigationService) { }

    state: {}

    ngOnInit(): void {
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
        this.ordersObservable = this.orderService.getNewestAnnotedOrders(1200);
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
    }

    private suppliersObservable: Observable<any>;
    private ordersObservable: Observable<any>;
}