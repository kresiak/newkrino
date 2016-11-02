import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { ProductService } from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthService } from './../Shared/Services/auth.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit {
    constructor(private supplierService: SupplierService, private productService: ProductService, private route: ActivatedRoute, private authService: AuthService, private router: Router) {

    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            let supplierId = params['id'];
            if (supplierId) {
                this.supplierService.getSupplier(supplierId).subscribe(supplier => this.supplier = supplier);
                this.productsBasketObservable = this.productService.getAnnotatedProductsInBasketBySupplier(supplierId);
                this.productsBasketObservable.subscribe(products => this.productsInBasket= products);
            }
        });
    }

    private productsBasketObservable: Observable<any>;
    private productsInBasket: any[];
    private supplier;

    createOrder(): void {
        var observable= this.productService.createOrderFromBasket(this.productsInBasket, this.supplier._id);

        if (observable)
        {
            observable.subscribe(res => {
                    var orderId = res._id;
                    let link = ['/order', orderId];
                    this.router.navigate(link);
                });
        }
    }
}