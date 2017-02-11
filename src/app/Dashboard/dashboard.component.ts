import {Component, Input, OnInit} from '@angular/core'
import {UserService} from '../Shared/Services/user.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-dashboard',
        templateUrl: './dashboard.component.html'  
    }
)
export class DashboardComponent implements OnInit
{

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription 
    constructor(private userService: UserService, private authService: AuthService)
    {

    }

    ngOnInit() : void
    {
        this.dashletsObservable= this.userService.getDashletsForCurrentUser();
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }
    

    private dashletsObservable: Observable<any>;

}