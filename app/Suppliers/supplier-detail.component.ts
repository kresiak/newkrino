import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from './../Shared/Services/product.service'
import {Observable} from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit
{
    constructor(private productService: ProductService)    {}

    ngOnInit(): void{
        this.supplierObservable.subscribe(supplier => 
        {
            this.supplier= supplier;
            this.productsObservable= this.productService.getProductsBySupplier(supplier);
            this.productsBasketObservable= this.productService.getProductsInBasketBySupplier(supplier);
            this.productsBasketObservable.subscribe(products => this.isThereABasket= products && products.length > 0);            
        });
    }

    @Input() supplierObservable: Observable<any>;
    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean= false;
}