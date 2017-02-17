import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        selector: 'gg-order-fridge-list',
        templateUrl: './order-fridge-list.component.html'
    }
)

export class OrderFridgeListComponent implements OnInit {
    private ordersList;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription 
    private subscriptionOrder: Subscription 
   
    constructor(private dataStore: DataStore, private authService: AuthService) {}

    @Input() fridgeOrdersObservable: Observable<any>;

    ngOnInit(): void {

        this.subscriptionOrder= this.fridgeOrdersObservable.subscribe(orders => {
            this.ordersList = orders;
        });

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        
    };    

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionOrder.unsubscribe()
    }
    
    orderUpdated(qtyNew, order) {
        order.data.quantity = qtyNew;
        this.dataStore.updateData('orders.fridge', order.data._id, order.data)
    };

    isDeliveredUpdated(disabled:boolean, order: any) {
        order.data.isDelivered = disabled;
        this.dataStore.updateData('orders.fridge', order.data._id, order.data);
    };

};
