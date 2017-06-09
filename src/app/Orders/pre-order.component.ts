import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { BasketService } from './../Shared/Services/basket.service'
import { OrderService } from './../Shared/Services/order.service'
import { EquipeService } from '../Shared/Services/equipe.service';
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService, private basketService: BasketService, private route: ActivatedRoute, 
                private authService: AuthService, private equipeService: EquipeService, private router: Router) {

    }

    private groupsForSelectionObservable: Observable<any>
    private groups: any[]
    private authorizationStatusInfo: AuthenticationStatusInfo;

    private isEnoughBudget: boolean = false
    private isTotalUnderLimit: boolean = false
    private isGroupOrdersUser: boolean = false

    private isOtpOk: boolean = false
    private isPageRunning: boolean= true

    ngOnInit(): void {
        this.route.params.takeWhile(() => this.isPageRunning).subscribe((params: Params) => {
            let supplierId = params['id']
            if (supplierId) {
                this.supplierService.getSupplier(supplierId).takeWhile(() => this.isPageRunning).subscribe(supplier => this.supplier = supplier)
                this.productsBasketObservable = this.basketService.getAnnotatedProductsInCurrentUserBasketBySupplierWithOtp(supplierId)
                this.productsBasketObservable.takeWhile(() => this.isPageRunning).subscribe(products => {
                    this.productsInBasket = products
                    this.isOtpOk = products.filter(product => product.annotation.otp && !product.annotation.otp._id).length == 0

                    this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
                        this.authorizationStatusInfo = statusInfo
                        if (statusInfo.isGroupOrdersUser()) {
                            this.isGroupOrdersUser = true
                        }
                        else {
                            this.isGroupOrdersUser = false
                            this.equipeService.getAnnotatedCurrentEquipe().takeWhile(() => this.isPageRunning).subscribe(eq => {
                                if (!eq) return
                                var total = products.map(item => item.annotation.totalPrice).reduce((a, b) => a + b, 0)
                                this.isEnoughBudget = total < eq.annotation.amountAvailable
                                var totalHtva = products.map(item => item.annotation.totalPriceHTva).reduce((a, b) => a + b, 0)
                                this.isTotalUnderLimit= totalHtva < 8500
                            })

                        }
                    });


                })

            }
        });

        this.groupsForSelectionObservable = this.equipeService.getAnnotatedEquipesGroups().map(groups => groups.map(group => {
            return {
                id: group.data._id,
                name: group.data.name
            }
        }))

        this.equipeService.getAnnotatedEquipesGroups().takeWhile(() => this.isPageRunning).subscribe(groups => {
            this.groups = groups
        })


    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    private productsBasketObservable: Observable<any>;
    private selectedGroupId: string = undefined
    private productsInBasket: any[];
    private supplier;

    createOrder(): void {
        var observable = this.basketService.createOrderFromBasket(this.productsInBasket, this.supplier._id, !this.selectedGroupId ? undefined : this.groups.filter(group => group.data._id === this.selectedGroupId)[0]);

        if (observable) { 
            observable.takeWhile(() => this.isPageRunning).subscribe(res => {
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