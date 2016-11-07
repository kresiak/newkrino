import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from './../Shared/Services/product.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { Router } from '@angular/router';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit {
    constructor(private productService: ProductService, private orderService: OrderService, private router: Router) {

    }

    @Input() supplierObservable: Observable<any>;
    @Input() state;
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    ngOnInit(): void {
        this.stateInit();

        this.supplierObservable.subscribe(supplier => {
            this.supplier = supplier;
            if (supplier) {
                this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier._id);
                this.productsBasketObservable = this.productService.getAnnotatedProductsInBasketBySupplier(supplier._id);
                this.productsBasketObservable.subscribe(products => this.isThereABasket = products && products.length > 0);
                this.ordersObservable = this.orderService.getAnnotedOrdersBySupplier(supplier._id);
                this.ordersObservable.subscribe(orders => this.anyOrder = orders && orders.length > 0);
            }
        });
    }


    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean = false;
    private anyOrder: boolean;

    gotoPreOrder() {
        let link = ['/preorder', this.supplier._id];
        this.router.navigate(link);
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