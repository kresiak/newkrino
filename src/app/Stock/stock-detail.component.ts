import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from './../Shared/Services/order.service'
import { StockService } from '../Shared/Services/stock.service';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-stock-detail',
        templateUrl: './stock-detail.component.html'
    }
)
export class StockDetailComponent implements OnInit {
    constructor(private authService: AuthService, private orderService: OrderService, private dataStore: DataStore) {

    }

    @Input() productObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private productStockSets;

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    private isPageRunning: boolean= true
    private authorizationStatusInfo: AuthenticationStatusInfo;
    
    private getUserName
    private getOrderId

    ngOnInit(): void {
        this.stateInit();

        this.productObservable.takeWhile(() => this.isPageRunning).subscribe(product => {
            this.productStockSets = product ? product.values : [];
        });

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })

        this.authService.getAnnotatedUsersHashmap().takeWhile(() => this.isPageRunning).subscribe(usersMap => {
            this.getUserName= userId => usersMap.get(userId).annotation.fullName
        })

        this.orderService.getKrinoIdLightMap().takeWhile(() => this.isPageRunning).subscribe(orderIdMap => {
            this.getOrderId= orderId => orderIdMap.get(orderId).kid
        })
        
    }

    ngOnDestroy(): void {
        this.isPageRunning= false
    }


    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    deteteHistoryItem(stockProductItem, historyItem) {
        var pos = stockProductItem.data.history.indexOf(historyItem)
        if (pos >= 0) stockProductItem.data.history.splice(pos, 1)
        this.dataStore.updateData('products.stock', stockProductItem.data._id, stockProductItem.data);
    }

    stockQuantitySaved(stockProductItem, qty) {
        stockProductItem.data.quantity= qty
        this.dataStore.updateData('products.stock', stockProductItem.data._id, stockProductItem.data);
    }


}