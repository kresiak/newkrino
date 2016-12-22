import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './product-list.routable.component.html'
    }
)
export class ProductListComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private supplierService: SupplierService) { }

    ngOnInit(): void {
        this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoAll();
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
    }

    private productsObservable: Observable<any>;
    private suppliersObservable: Observable<any>;

}