import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

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
                            item.annotation.idObservable= new BehaviorSubject<any[]>([item.data.otp]); 
                        });
                    
                });
            }
        });
    }

    private order;
    private selectableOtpsObservable: Observable<any>;

    otpUpdated(orderItem, newOtpIds) : void
    {
        if (newOtpIds && newOtpIds.length > 0)
        {
            orderItem.data.otp= newOtpIds[0];
            orderItem.annotation.idObservable.next([orderItem.data.otp]);
            this.orderService.updateOrder(this.order.data);
        }             
    }

}
