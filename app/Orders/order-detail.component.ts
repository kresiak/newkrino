import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import {DataStore} from '../Shared/Services/data.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'

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
    constructor(private orderService: OrderService, private route: ActivatedRoute, private userService: UserService, private dataStore: DataStore) {     }

    @Input() orderObservable : Observable<any>;

    ngOnInit(): void {
            this.orderObservable.subscribe(order => {
                this.order = order
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

    setDashlet() {
        this.userService.createOrderDashletForCurrentUser(this.order.data._id);
    }

    removeDashlet(dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    }

    commentsUpdated(comments)
    {
        if (this.order && comments)
        {
            this.order.data.comments= comments;
            this.dataStore.updateData('orders', this.order.data._id, this.order.data);
        }
        
    }
}
