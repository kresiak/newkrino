import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, Inject } from '@angular/core'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { OrderService } from '../Shared/Services/order.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './equipe-list.routable.component.html'        
    }
)
export class EquipeListComponentRoutable implements OnInit, AfterViewInit {
    
    constructor(private navigationService: NavigationService, private authService: AuthService, private orderService: OrderService) { 

    }

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

        this.annotatedGiftsObservable= this.orderService.getAnnotatedEquipesGifts()
    }

    private annotatedGiftsObservable: Observable<any>

    private authorizationStatusInfo: AuthenticationStatusInfo;
}