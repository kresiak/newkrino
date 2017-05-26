import { Component, Input, OnInit } from '@angular/core'
import { UserService } from '../Shared/Services/user.service'
import { NotificationService } from '../Shared/Services/notification.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { NavigationService } from './../Shared/Services/navigation.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-dashboard',
        templateUrl: './dashboard.component.html'
    }
)
export class DashboardComponent implements OnInit {

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionLmMessages: Subscription

    private labManagerMessages: any
    initTabId = ''


    constructor(private userService: UserService, private authService: AuthService, private notificationService: NotificationService, private navigationService: NavigationService) {

    }

    ngOnInit(): void {
        this.dashletsObservable = this.userService.getDashletsForCurrentUser();
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
        this.subscriptionLmMessages = this.notificationService.getLmWarningMessages().subscribe(m => {
            this.labManagerMessages = m
        })

    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionLmMessages.unsubscribe()
    }


    private dashletsObservable: Observable<any>;

    navigateToOrder(id) {
        this.navigationService.maximizeOrUnmaximize('/order', id, 'dashboard', false)
    }

}