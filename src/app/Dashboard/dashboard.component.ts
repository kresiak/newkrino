import { Component, Input, OnInit } from '@angular/core'
import { UserService } from '../Shared/Services/user.service'
import { NotificationService } from '../Shared/Services/notification.service'
import { Observable } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { DataStore } from './../Shared/Services/data.service'
import * as moment from "moment"

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-dashboard',
        templateUrl: './dashboard.component.html'
    }
)
export class DashboardComponent implements OnInit {
    privateMessages: any[];
    private authorizationStatusInfo: AuthenticationStatusInfo;

    private labManagerMessages: any
    initTabId = ''


    constructor(private dataStore: DataStore, private userService: UserService, private authService: AuthService, private notificationService: NotificationService, private navigationService: NavigationService) {

    }

    ngOnInit(): void {
        this.dashletsObservable = this.userService.getDashletsForCurrentUser();

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).do(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        }).switchMap(noUse => {
            return this.dataStore.getDataObservable('messages').takeWhile(() => this.isPageRunning)    
        }).subscribe(messages => {
            this.privateMessages= messages.filter(m => m.isPrivate && m.toUserId===this.authorizationStatusInfo.currentUserId && !m.isRead).sort((a, b) => {
                                var d1 = moment(a.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                                var d2 = moment(b.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                                return d1 < d2 ? 1 :  -1
                            })
        })

        this.notificationService.getLmWarningMessages().takeWhile(() => this.isPageRunning).subscribe(m => {
            this.labManagerMessages = m
        })
       
    }

    private isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    private dashletsObservable: Observable<any>;

    navigateToOrder(id) {
        this.navigationService.maximizeOrUnmaximize('/order', id, 'dashboard', false)
    }

    navigateToOtp(id) {
        this.navigationService.maximizeOrUnmaximize('/otp', id, 'dashboard', false)
    }

    navigateToProduct(id) {
        this.navigationService.maximizeOrUnmaximize('/product', id, 'dashboard', false)
    }

    navigateToGeneric(objectType, id) {
        this.navigationService.maximizeOrUnmaximize('/' + objectType.trim(), id, 'dashboard', false)
    }
}