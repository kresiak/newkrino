import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import {OrderService} from './../Shared/Services/order.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"


@Component(
    {
        moduleId: module.id,
        selector: 'gg-product-detail',
        templateUrl: './product-detail.component.html'
    }
)

export class ProductDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService) {
    }

    @Input() productObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.categoryIds);
        this.productObservable.subscribe(product => {
            this.product = product;
            if (product) {
                this.ordersObservable= this.orderService.getAnnotedOrdersByProduct(product.data._id)
            }
        });
    }

    //private model;
    private product;
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;

    categorySelectionChanged(selectedIds: string[]) {
        this.product.data.categoryIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    commentsUpdated(comments) {
        if (this.product && comments) {
            this.product.data.comments = comments;
            this.dataStore.updateData('products', this.product.data._id, this.product.data);
        }

    }

    quantityBasketUpdated(quantity: string) {
        this.productService.doBasketUpdate(this.product, quantity)
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