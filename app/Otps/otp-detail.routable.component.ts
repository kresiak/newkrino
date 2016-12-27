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

    ourObject: any
    lastPath: string

    otpObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.otpObservable = this.orderService.getAnnotatedOtpById(id);
            this.otpObservable.subscribe(obj => {
                this.ourObject = obj
            })
        }
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(queryParams => {
            this.lastPath = queryParams['path'];
        })
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
    }

}
