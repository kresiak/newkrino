import { Component, OnInit, Input } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        template: `<gg-order-list [ordersObservable]= "ordersObservable"></gg-order-list>`
    }
)
export class OrderListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.ordersObservable= this.orderService.getAnnotedOrders();
    }

    private ordersObservable: Observable<any>;
}



@Component(
    {
        moduleId: module.id,
        selector: 'gg-order-list',
        templateUrl: './order-list.component.html'
    }
)
export class OrderListComponent implements OnInit {
    constructor(private orderService: OrderService) {

    }

    @Input() ordersObservable: Observable<any>;

    ngOnInit(): void {
    }

    getOrderObservable(id: string): Observable<any> {
        return this.ordersObservable.map(orders => orders.filter(s => s.data._id === id)[0]);
    }

    formatDate(date: string): string {
        return (new Date(date)).toLocaleDateString()
    }
}

