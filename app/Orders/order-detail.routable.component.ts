import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './order-detail.routable.component.html'        
    }
)
export class OrderComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) { }

    order: any
    lastPath: string

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
        this.route.queryParams.subscribe(queryParams => {
            this.lastPath = queryParams['path'];
        })
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
    }
    
}
