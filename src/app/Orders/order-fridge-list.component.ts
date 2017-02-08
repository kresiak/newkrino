import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import {OrderService} from '../Shared/Services/order.service'

@Component(
    {
        selector: 'gg-order-fridge-list',
        templateUrl: './order-fridge-list.component.html'
    }
)

export class OrderFridgeListComponent implements OnInit {
    private ordersList;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    
    constructor(private dataStore: DataStore, private authService: AuthService, private orderService: OrderService ) {}

    ngOnInit(): void {

        this.orderService.getAnnotatedFridgeOrders().subscribe(orders => {
            this.ordersList = orders;
        });

        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        
    };    

    orderUpdated(qtyNew, order) {
        order.data.quantity = qtyNew;
        this.dataStore.updateData('orders.fridge', order.data._id, order.data)
    };

    isDeliveredUpdated(disabled:boolean, order: any) {
        order.data.isDelivered = disabled;
        this.dataStore.updateData('orders.fridge', order.data._id, order.data);
    };

};
