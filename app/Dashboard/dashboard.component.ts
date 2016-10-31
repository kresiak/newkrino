import {Component, Input, OnInit} from '@angular/core'
import {UserService} from '../Shared/Services/user.service'
import { Observable} from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-dashboard',
        templateUrl: './dashboard.component.html'  
    }
)
export class DashboardComponent implements OnInit
{
    constructor(private userService: UserService)
    {

    }

    ngOnInit() : void
    {
        this.dashletsObservable= this.userService.getDashletsForCurrentUser();
    }

    private dashletsObservable: Observable<any>;

}