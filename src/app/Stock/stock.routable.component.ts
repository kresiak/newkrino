import { Component, OnInit, Input, Output } from '@angular/core'
import { SupplierService } from './../Shared/Services/supplier.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { ProductService } from './../Shared/Services/product.service'


@Component(
    {
        //moduleId: module.id,
        templateUrl: './stock.routable.component.html'        
    }
)
export class StockComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private navigationService: NavigationService, private authService: AuthService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        

        this.productsObservable = this.productService.getAnnotatedAvailableStockProductsAll();
        this.ordersObservable = this.productService.getAnnotatedStockOrdersAll()

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })

    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionState.unsubscribe()
    }
        
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     
    private subscriptionState: Subscription 
    private productsObservable: Observable<any>;
    private ordersObservable: Observable<any>;
}

