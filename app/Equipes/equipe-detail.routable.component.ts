import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './equipe-detail.routable.component.html'        
    }
)
export class EquipeDetailComponentRoutable implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute) { }

    equipe: any

    equipeObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.equipeObservable = this.orderService.getAnnotatedEquipeById(id);
            this.equipeObservable.subscribe(obj => {
                this.equipe = obj
            })
        }
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
    }
    
}
