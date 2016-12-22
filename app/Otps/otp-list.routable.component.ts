import { Component, Input, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.otpsObservable = this.orderService.getAnnotatedOtps();
    }

    private otpsObservable: Observable<any>;
}
