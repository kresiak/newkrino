import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { NavigationService } from './../Shared/Services/navigation.service'



@Component(
    {
        moduleId: module.id,
        selector: 'gg-product-detail',
        templateUrl: './product-detail.component.html'
    }
)

export class ProductDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private navigationService: NavigationService) {
    }

    @Input() productObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false
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
                this.ordersObservable = this.orderService.getAnnotedOrdersByProduct(product.data._id)
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
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/product', this.product.data._id, this.path, this.isRoot)
        }

        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    nameUpdated(name: string) {
        this.product.data.name = name;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    packageUpdated(packName: string) {
        this.product.data.package = packName;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    catalogNrUpdated(catNr: string) {
        this.product.data.catalogNr = catNr;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    priceProdUpdated(priceProd) {
        this.product.data.price = priceProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    noArticleUpdated(noArt: string) {
        this.product.data.noArticle = noArt;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    groupMarchUpdated(groupM: string) {
        this.product.data.groupMarch = groupM;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    tvaUpdated(tvaProd: number) {
        this.product.data.tva = tvaProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    resoldUpdated(resold) {
        this.product.data.isResold = resold;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    disablUpdated(isDisable) {
        this.product.data.disabled = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    distribUpdated(isDisable) {
        this.product.data.isDistributed = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }
}