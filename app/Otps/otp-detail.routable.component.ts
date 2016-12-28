import { Component, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NavigationService } from '../Shared/Services/navigation.service'


@Component(
    {
        moduleId: module.id,
        templateUrl: './otp-detail.routable.component.html'
    }
)
export class OtpDetailComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute, private navigationService: NavigationService) { }

    ourObject: any
    state: {}    

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
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
    }

}
