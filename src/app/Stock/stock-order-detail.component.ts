import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { AuthService } from './../Shared/Services/auth.service'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-stock-order-detail',
        templateUrl: './stock-order-detail.component.html'
    }
)
export class StockOrderDetailComponent implements OnInit {
    constructor(private authService: AuthService, private dataStore: DataStore) {

    }

    private order;
    @Input() orderObservable: Observable<any>;
    @Input() state;
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    formStockInit(order) {
    }

    subscriptionOrder: Subscription

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionOrder= this.orderObservable.subscribe(order => {
            this.order = order;
            if (order)
                this.formStockInit(order);
        });
    }

    ngOnDestroy(): void {
         this.subscriptionOrder.unsubscribe()
    }


    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }
}