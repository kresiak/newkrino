import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Observable } from 'rxjs/Rx'
import { AuthService } from './../Shared/Services/auth.service'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        moduleId: module.id,
        selector: 'gg-stock-detail',
        templateUrl: './stock-detail.component.html'
    }
)
export class StockDetailComponent implements OnInit {
    constructor(private authService: AuthService, private dataStore: DataStore) {

    }

    private product;
    private frmStockOrder: FormGroup;
    @Input() productObservable: Observable<any>;
    @Input() state;
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    formStockInit(product) {
        this.frmStockOrder = new FormGroup({});
        product.values.forEach(prod => {
            this.frmStockOrder.addControl(prod.data._id, new FormControl('0'));
        });
    }

    ngOnInit(): void {
        this.stateInit();

        this.productObservable.subscribe(product => {
            this.product = product;
            if (product)
                this.formStockInit(product);
        });
    }

    save(formValue, isValid) {
        let userId = this.authService.getUserId();
        let equipeId = this.authService.getEquipeId();
        let now = new Date();
        this.product.values.forEach(stockItem => {
            if (formValue[stockItem.data._id] && +formValue[stockItem.data._id] > 0) {
                if (!stockItem.data.sales) stockItem.data.sales = [];
                stockItem.data.sales.push({
                    quantity: +formValue[stockItem.data._id],
                    userId: userId,
                    equipeId: equipeId,
                    date: now
                });
                this.dataStore.updateData('productsStock', stockItem.data._id, stockItem.data);
            }
        });
    }

    reset() {
        this.formStockInit(this.product);
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