import { Component, OnInit, Input, Output } from '@angular/core'
import { SupplierService } from './../Shared/Services/supplier.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { ProductService } from './../Shared/Services/product.service'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'


@Component(
    {
        //moduleId: module.id,
        templateUrl: './stock.routable.component.html'        
    }
)
export class StockComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private navigationService: NavigationService, private authService: AuthService, private route: ActivatedRoute) { }

    state
    initTabId= ''

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initTabId;
    }

    ngOnInit(): void {
        this.stateInit()
        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        

        this.productsObservable = this.productService.getAnnotatedAvailableStockProductsAll();
        this.ordersObservable = this.productService.getAnnotatedStockOrdersAll()

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })

        this.route.queryParams.first().subscribe(queryParams => {
            this.initTabId = queryParams['tab'];
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

