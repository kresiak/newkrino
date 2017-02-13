import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from './../Shared/Services/product.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import * as moment from "moment"

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-stock-order-detail',
        templateUrl: './stock-order-detail.component.html'
    }
)
export class StockOrderDetailComponent implements OnInit {
    constructor(private authService: AuthService, private dataStore: DataStore, private productService: ProductService) {

    }

    private order;
    private stockItems: any[];
    private frmStockOrder: FormGroup;
    @Input() orderObservable: Observable<any>;
    @Input() state;
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    formStockInit(stockItems) {
        this.frmStockOrder = new FormGroup({});
        stockItems.forEach(item => {    // here item is as item in products.stock collection
            this.frmStockOrder.addControl(item.data._id, new FormControl('0'));
        });        
    }

    private subscriptionOrder: Subscription
    private stockItemsObservable: Observable<any>
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionOrder= this.orderObservable.subscribe(order => {
            this.order = order;
            if (order) {
                this.stockItemsObservable= this.productService.getAnnotatedAvailableStockProductsByProduct(order.data.productId)
                this.stockItemsObservable.first().subscribe(stockItems =>{
                    this.stockItems= stockItems
                    this.formStockInit(stockItems)
                })
            }                
        });

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })
        
    }

    ngOnDestroy(): void {
         this.subscriptionOrder.unsubscribe()
         this.subscriptionAuthorization.unsubscribe()
    }

    commentsUpdated(comments) {
        if (this.order && comments) {
            this.order.data.comments = comments;
            this.dataStore.updateData('orders.stock', this.order.data._id, this.order.data);
        }

    }

    private isProcessFormOK: boolean= true

    save(formValue: Object, isValid) {
        let nbTotal= Object.keys(formValue).map(key => +formValue[key]).reduce((a, b) => a+b, 0)
        this.isProcessFormOK= nbTotal > 0
        if (!this.isProcessFormOK) return
        let userId = this.order.data.userId;
        let equipeId = this.order.data.equipeId;
        let now = moment().format('DD/MM/YYYY HH:mm:ss')
        this.order.data.stockItemIds= []
        this.stockItems.forEach(stockItem => {
            if (formValue[stockItem.data._id] && +formValue[stockItem.data._id] > 0) {
                this.order.data.stockItemIds.push(stockItem.data._id)
                if (!stockItem.data.sales) stockItem.data.sales = [];
                stockItem.data.sales.push({
                    quantity: +formValue[stockItem.data._id],
                    userId: userId,
                    equipeId: equipeId,
                    stockOrderId: this.order.data._id,
                    date: now
                });
                this.dataStore.updateData('products.stock', stockItem.data._id, stockItem.data);
            }
        });
        this.order.data.isProcessed= true
        this.dataStore.updateData('orders.stock', this.order.data._id, this.order.data);
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