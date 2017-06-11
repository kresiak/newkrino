import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { BasketService } from './../Shared/Services/basket.service'
import { OrderService } from './../Shared/Services/order.service'
import { EquipeService } from '../Shared/Services/equipe.service';
import { SupplierService } from './../Shared/Services/supplier.service'
import { AdminService } from './../Shared/Services/admin.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        templateUrl: './pre-order.component.html'
    }
)
export class PreOrderComponent implements OnInit {
    constructor(private orderService: OrderService, private supplierService: SupplierService, private basketService: BasketService, private route: ActivatedRoute, 
                private authService: AuthService, private equipeService: EquipeService, private adminService: AdminService, private router: Router) {

    }

    private groupsForSelectionObservable: Observable<any>
    private groups: any[]
    private authorizationStatusInfo: AuthenticationStatusInfo;

    private isEnoughBudget: boolean = false
    private isTotalUnderLimit: boolean = false
    private isGroupOrdersUser: boolean = false

    private isOtpOk: boolean = false
    private isSubmitButtonFree: boolean = true

    private maximumSpendingAccepted: number= 500

    private isPageRunning: boolean= true

    ngOnInit(): void {
        this.route.params.switchMap((params: Params) => {
            let supplierId = params['id']
            return this.supplierService.getSupplier(supplierId)
        })
        .filter(supplier => supplier)
        .do(supplier => {
            this.supplier= supplier
        })
        .map(supplier => this.basketService.getAnnotatedProductsInCurrentUserBasketBySupplierWithOtp(supplier._id))
        .do(productObervable => {
            this.productsBasketObservable= productObervable
        })
        .switchMap(productObervable => {
            return productObervable.takeWhile(() => this.isPageRunning)   //takeWhile necessary on each starting observable path  (otherwise will survive the page)
        })        
        .do(products => {
            this.productsInBasket = products
            this.isOtpOk = products.filter(product => product.annotation.otp && !product.annotation.otp._id).length == 0            
        })
        .combineLatest(
            this.authService.getStatusObservable().takeWhile(() => this.isPageRunning)    //takeWhile necessary on each starting observable path
                .do((statusInfo) => {
                    this.authorizationStatusInfo = statusInfo
                    this.isGroupOrdersUser= statusInfo.isGroupOrdersUser()
                })
                .map(statusInfo => statusInfo.isGroupOrdersUser()),
            this.adminService.getLabo().map(labo => labo.data.maxOrderAmount).takeWhile(() => this.isPageRunning),    //takeWhile necessary on each starting observable path
            (products, isGroupOrderUser, maxOrderAmount) => {
                var totalHtva = products.map(item => item.annotation.totalPriceHTva).reduce((a, b) => a + b, 0)
                return { 
                    total : products.map(item => item.annotation.totalPrice).reduce((a, b) => a + b, 0),
                    isTotalUnderLimit: totalHtva < maxOrderAmount,
                    isGroupOrderUser: isGroupOrderUser
                }
            }
        )
        .do(infoObject => {
            this.isTotalUnderLimit= infoObject.isTotalUnderLimit
        })
        .filter(infoObject => !infoObject.isGroupOrderUser)
        .switchMap(infoObject => {
            return this.equipeService.getAnnotatedCurrentEquipe().filter(eq => eq).map(eq => infoObject.total < eq.annotation.amountAvailable).takeWhile(() => this.isPageRunning)  //takeWhile necessary on each switchmap 
        })
        .do(isEnoughBudget => {
            this.isEnoughBudget= isEnoughBudget
        })
        .takeWhile(() => this.isPageRunning)
        .subscribe(res => {
        })


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
        if (!this.isSubmitButtonFree) return
        this.isSubmitButtonFree= false
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