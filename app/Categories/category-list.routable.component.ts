import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './category-list.routable.component.html'
    }
)
export class CategoryListComponentRoutable implements OnInit {
    constructor(private navigationService: NavigationService, private authService: AuthService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }


    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })
    }

    private authorizationStatusInfo: AuthenticationStatusInfo;
}