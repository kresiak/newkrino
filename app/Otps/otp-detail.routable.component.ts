import { Component, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service';


@Component(
    {
        moduleId: module.id,
        templateUrl: './otp-detail.routable.component.html'
    }
)
export class OtpDetailComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(queryParams => {
            this.lastPath = queryParams['path'];
        })
        this.route.params.subscribe((params: Params) => {
            let otpId = params['id'];
            
            if (otpId) {
                this.otpObservable = this.orderService.getAnnotatedOtpById(otpId);
                this.otpObservable.subscribe(otp => {
                    this.otp = otp
                })
            }
        });
    }
    otpObservable: Observable<any>;
    otp: any
    lastPath: string
}
