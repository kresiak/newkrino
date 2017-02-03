import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './order-detail.routable.component.html'        
    }
)
export class OrderComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute, private navigationService: NavigationService, private authService: AuthService) { }

    order: any
    state: {}

    private authorizationStatusInfo: AuthenticationStatusInfo;

    orderObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.orderObservable = this.orderService.getAnnotedOrder(id);
            this.orderObservable.subscribe(obj => {
                this.order = obj
            })
        }
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }
    
}
