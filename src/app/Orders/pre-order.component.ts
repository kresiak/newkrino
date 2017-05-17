import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { ProductService } from './../Shared/Services/product.service'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService, private productService: ProductService, private route: ActivatedRoute, private authService: AuthService, private router: Router) {

    }

    private groupsForSelectionObservable: Observable<any>
    private groups: any[]
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionRoute: Subscription
    private subscriptionEquipeGroups: Subscription
    //private subscriptionProductBasket: Subscription
    private subscriptionProductBasket2: Subscription

    private isEnoughBudget: boolean = false
    private isGroupOrdersUser: boolean = false

    private isOtpOk: boolean = false

    ngOnInit(): void {
        this.subscriptionRoute = this.route.params.subscribe((params: Params) => {
            let supplierId = params['id']
            if (supplierId) {
                this.supplierService.getSupplier(supplierId).subscribe(supplier => this.supplier = supplier)
                this.productsBasketObservable = this.productService.getAnnotatedProductsInCurrentUserBasketBySupplierWithOtp(supplierId)
                this.subscriptionProductBasket2 = this.productsBasketObservable.subscribe(products => {
                    this.productsInBasket = products
                    this.isOtpOk = products.filter(product => product.annotation.otp && !product.annotation.otp._id).length == 0

                    this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
                        this.authorizationStatusInfo = statusInfo
                        if (statusInfo.isGroupOrdersUser()) {
                            this.isGroupOrdersUser = true
                        }
                        else {
                            this.isGroupOrdersUser = false
                            this.orderService.getAnnotatedCurrentEquipe().first().subscribe(eq => {
                                if (!eq) return
                                var total = products.map(item => item.annotation.totalPrice).reduce((a, b) => a + b, 0)
                                this.isEnoughBudget = total < eq.annotation.amountAvailable
                            })

                        }
                    });


                })

            }
        });

        this.groupsForSelectionObservable = this.orderService.getAnnotatedEquipesGroups().map(groups => groups.map(group => {
            return {
                id: group.data._id,
                name: group.data.name
            }
        }))

        this.subscriptionEquipeGroups = this.orderService.getAnnotatedEquipesGroups().subscribe(groups => {
            this.groups = groups
        })


    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionRoute.unsubscribe()
        this.subscriptionEquipeGroups.unsubscribe()
        //if (this.subscriptionProductBasket) this.subscriptionProductBasket.unsubscribe()
        if (this.subscriptionProductBasket2) this.subscriptionProductBasket2.unsubscribe()
    }


    private productsBasketObservable: Observable<any>;
    private selectedGroupId: string = undefined
    private productsInBasket: any[];
    private supplier;

    createOrder(): void {
        var observable = this.productService.createOrderFromBasket(this.productsInBasket, this.supplier._id, !this.selectedGroupId ? undefined : this.groups.filter(group => group.data._id === this.selectedGroupId)[0]);

        if (observable) {
            observable.subscribe(res => {
                var orderId = res._id;
                let link = ['/order', orderId];
                this.router.navigate(link);
            });
        }
    }

    equipeGroupChanged(newid) {
        this.selectedGroupId = newid
    }

}