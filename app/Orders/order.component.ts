import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './order.component.html'
    }
)
export class OrderComponent implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) {

    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            let orderId = params['id'];
            if (orderId) {
                this.orderService.getAnnotedOrder(orderId).subscribe(order => {
                    this.order = order
                    if (this.order && this.order.data && this.order.data.date)
                        this.order.annotation.date = (new Date(this.order.data.date)).toLocaleDateString();
                    this.selectableOtpsObservable = this.orderService.getSelectableOtps();
                    if (this.order && this.order.annotation)
                        this.order.annotation.items.forEach(item => {
                            item.annotation.idObservable=Observable.from([item.data.otp])
                        });
                    
                });
            }
        });
    }

    private order;
    private selectableOtpsObservable: Observable<any>;

}
