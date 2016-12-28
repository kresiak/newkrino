import { Component, Input, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NavigationService } from '../Shared/Services/navigation.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private navigationService: NavigationService) { }

    state: {}

    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.otpsObservable = this.orderService.getAnnotatedOtps();
    }

    private otpsObservable: Observable<any>;
}

