import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { ProductService } from './../Shared/Services/product.service'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService, private productService: ProductService, private route: ActivatedRoute, private authService: AuthService, private router: Router) {

    }

    private groupsAnnotable: Observable<any>
    private authorizationStatusInfo: AuthenticationStatusInfo;

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            let supplierId = params['id'];
            if (supplierId) {
                this.supplierService.getSupplier(supplierId).subscribe(supplier => this.supplier = supplier);
                this.productsBasketObservable = this.productService.getAnnotatedProductsInBasketBySupplier(supplierId);
                this.productsBasketObservable.subscribe(products => this.productsInBasket= products);
            }
        });

        this.groupsAnnotable= this.orderService.getAnnotatedEquipesGroups().map(groups => groups.map(group => {
            return {
                id: group.data._id,
                name: group.data.name
            }
        }))

        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        
    }

    private productsBasketObservable: Observable<any>;
    private selectedGroupId: string = '-1'
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

    equipeGroupChanged(newid) {
        if (!newid) newid= '-1'
        this.selectedGroupId= newid
    }
    
}