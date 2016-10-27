import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        template: `<gg-order-detail [orderObservable]= "orderObservable"></gg-order-detail>`
    }
)
export class OrderComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) {    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            let orderId = params['id'];
            if (orderId){
               this.orderObservable=  this.orderService.getAnnotedOrder(orderId);
            }
        });
    }
    orderObservable : Observable<any>;
}


@Component(
    {
        moduleId: module.id,
        selector: 'gg-order-detail',
        templateUrl: './order-detail.component.html'
    }
)
export class OrderDetailComponent implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) {     }

    @Input() orderObservable : Observable<any>;

    ngOnInit(): void {
            this.orderObservable.subscribe(order => {
                this.order = order
                if (this.order && this.order.data && this.order.data.date)
                    this.order.annotation.date = (new Date(this.order.data.date)).toLocaleDateString();
                this.selectableOtpsObservable = this.orderService.getSelectableOtps();
                if (this.order && this.order.annotation)
                    this.order.annotation.items.forEach(item => {
                        item.annotation.idObservable = new BehaviorSubject<any[]>([item.data.otp]);
                    });
            });
    }

    private order;
    private selectableOtpsObservable: Observable<any>;

    otpUpdated(orderItem, newOtpIds): void {
        if (newOtpIds && newOtpIds.length > 0) {
            orderItem.data.otp = newOtpIds[0];
            orderItem.annotation.idObservable.next([orderItem.data.otp]);
            this.orderService.updateOrder(this.order.data);
        }
    }

}
