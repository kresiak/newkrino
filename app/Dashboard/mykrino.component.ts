import {Component, OnInit} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './mykrino.component.html'
 }
)
export class MyKrinoComponent implements OnInit{
    constructor(private orderService: OrderService)    {}

    ordersObservable: Observable<any>;

    ngOnInit():void{
        this.ordersObservable= this.orderService.getAnnotedOrdersOfCurrentUser();
    }

}

