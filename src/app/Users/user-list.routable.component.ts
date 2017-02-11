import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './user-list.routable.component.html'
    }
)
export class UserListComponentRoutable implements OnInit {
    constructor(private navigationService: NavigationService, private authService: AuthService) { }

    usersObservable: Observable<any>;

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }


    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })

        this.usersObservable = this.authService.getAnnotatedUsers();
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }
    
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     
}