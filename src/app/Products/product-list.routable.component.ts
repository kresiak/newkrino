import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './product-list.routable.component.html'
    }
)
export class ProductListComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private supplierService: SupplierService, private navigationService: NavigationService, private authService: AuthService) { }

    state: {}
    private subscriptionAuthorization: Subscription 


    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.productsObservable = this.productService.getAnnotatedProductsAll();
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })
        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state = state
        })
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
          this.subscriptionState.unsubscribe()
   }
    

    private productsObservable: Observable<any>;
    private suppliersObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionState: Subscription 
    

}
