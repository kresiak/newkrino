import {Component, OnInit} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './order-list.component.html'
 }
)
export class OrderListComponent implements OnInit{
    constructor(private orderService: OrderService)    {

    }

    orders: Observable<any>;

    ngOnInit():void{
        this.orders= this.orderService.getAnnotedOrders();
    }

    getOrderObservable(id: string) : Observable<any>
    {
        return this.orders.map(orders=> orders.filter(s => s.data._id===id)[0]);
    }

    formatDate(date: string): string
    {
        return (new Date(date)).toLocaleDateString()
    }
}

