import { Component, Input, OnInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { SapService } from './../Shared/Services/sap.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        templateUrl: './sap-list.routable.component.html'
    }
)
export class SapListComponentRoutable implements OnInit {
    constructor(private navigationService: NavigationService, private authService: AuthService, private sapService: SapService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.sapsObservable = this.sapService.getSapItemsObservable();

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })

    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionState.unsubscribe()
   }
    

    private sapsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription    
    private subscriptionState: Subscription 
}

