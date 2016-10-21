import {Component, OnInit} from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import {ProductService} from './../Shared/Services/product.service'
import {SupplierService} from './../Shared/Services/supplier.service'
import {Observable} from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit
{
    constructor(private supplierService: SupplierService, private productService: ProductService, private route: ActivatedRoute)
    {

    }

    ngOnInit(): void
    {
        this.route.params.subscribe((params : Params) =>
        {
            let supplierId= params['id'];
            if (supplierId)
            {
                this.supplierService.getSupplier(supplierId).subscribe(supplier => this.supplier= supplier);
                this.productsBasketObservable= this.productService.getProductsInBasketBySupplier(supplierId);
            }
        });
    }

    private productsBasketObservable: Observable<any>;
    private supplier;
}