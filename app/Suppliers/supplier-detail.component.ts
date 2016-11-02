import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from './../Shared/Services/product.service'
import {OrderService} from './../Shared/Services/order.service'
import {Observable} from 'rxjs/Rx'
import { Router } from '@angular/router';


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit
{
    constructor(private productService: ProductService, private orderService: OrderService,  private router: Router)    {}

    ngOnInit(): void{
        this.supplierObservable.subscribe(supplier => 
        {
            this.supplier= supplier;
            this.productsObservable= this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier._id);
            this.productsBasketObservable= this.productService.getAnnotatedProductsInBasketBySupplier(supplier._id);
            this.productsBasketObservable.subscribe(products => this.isThereABasket= products && products.length > 0);    
            this.ordersObservable= this.orderService.getAnnotedOrdersBySupplier(supplier._id);        
            this.ordersObservable.subscribe(orders => this.anyOrder= orders && orders.length > 0);
        });
    }

    @Input() supplierObservable: Observable<any>;
    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean= false;
    private anyOrder: boolean;

    gotoPreOrder()
    {
        let link = ['/preorder', this.supplier._id];
        this.router.navigate(link);        
    }
}