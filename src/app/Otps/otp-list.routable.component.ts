import { Component, Input, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private navigationService: NavigationService, private authService: AuthService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.otpsObservable = this.orderService.getAnnotatedOtps();
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })
    }

    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
}

