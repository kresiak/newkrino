import { Component, Input, OnInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { OtpService } from '../Shared/Services/otp.service'
import { SapService } from './../Shared/Services/sap.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private navigationService: NavigationService, private authService: AuthService, private sapService: SapService, private otpService: OtpService) { }

    state: {}
    equipesObservable: Observable<any>;

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.otpsObservable = this.otpService.getAnnotatedOtps();
        this.equipesObservable = this.orderService.getAnnotatedEquipes();
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })

    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionState.unsubscribe()
   }
    

    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription    
    private subscriptionState: Subscription 
}

