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
                this.productsBasketObservable = this.productService.getAnnotedProductsInBasketBySupplier(supplierId);
            }
        });
    }

    private productsBasketObservable: Observable<any>;
    private supplier;

    createOrder(): void {
        this.productsBasketObservable.subscribe(products => {
            if (products && products.length > 0) {
                var record = {
                    data: {
                        userId: this.authService.getUserId(),
                        equipeId: this.authService.getEquipeId(),
                        supplierId: this.supplier._id,
                        items: products.filter(product => product.annotation.quantity > 0).map(product => {
                            return {
                                product: product.data._id,
                                quantity: product.annotation.quantity,
                                otp: product.annotation.otp._id,
                                total: product.annotation.totalPrice
                            };
                        })
                    },
                    basketItems: products.filter(product => product.annotation.quantity > 0).map(product => product.annotation.basketId)
                };
                this.supplierService.passCommand(record).subscribe(res => {
                    var orderId = res._id;
                    let link = ['/order', orderId];
                    this.router.navigate(link);

                });
            }
        });
    }
}