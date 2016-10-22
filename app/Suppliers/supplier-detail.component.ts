import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from './../Shared/Services/product.service'
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
    constructor(private productService: ProductService, private router: Router)    {}

    ngOnInit(): void{
        this.supplierObservable.subscribe(supplier => 
        {
            this.supplier= supplier;
            this.productsObservable= this.productService.getAnnotedProductsBySupplier(supplier._id);
            this.productsBasketObservable= this.productService.getAnnotedProductsInBasketBySupplier(supplier._id);
            this.productsBasketObservable.subscribe(products => this.isThereABasket= products && products.length > 0);            
        });
    }

    @Input() supplierObservable: Observable<any>;
    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean= false;

    gotoPreOrder()
    {
        let link = ['/preorder', this.supplier._id];
        this.router.navigate(link);        
    }
}