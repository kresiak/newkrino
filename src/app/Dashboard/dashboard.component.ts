import {Component, Input, OnInit} from '@angular/core'
import {UserService} from '../Shared/Services/user.service'
import { Observable} from 'rxjs/Rx'
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
    constructor(private userService: UserService, private authService: AuthService)
    {

    }

    ngOnInit() : void
    {
        this.dashletsObservable= this.userService.getDashletsForCurrentUser();
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        
    }

    private dashletsObservable: Observable<any>;

}