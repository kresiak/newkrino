import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { VoucherService } from '../Shared/Services/voucher.service';
import { StockService } from '../Shared/Services/stock.service';
import { Observable, Subscription } from 'rxjs/Rx'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { DataStore } from '../Shared/Services/data.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './order-list.routable.component.html'
    }
)
export class OrderListComponentRoutable implements OnInit {
    laboName: string;
    constructor(private voucherService: VoucherService, private orderService: OrderService, private route: ActivatedRoute, private supplierService: SupplierService,
        private navigationService: NavigationService, private authService: AuthService, private stockService: StockService, private dataStore: DataStore) { }

    state
    initTabId = ''

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initTabId;
    }


    ngOnInit(): void {

        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence()
        this.ordersObservable = this.orderService.getAnnotedOrdersByNewest()
        this.stockOrdersObservable = this.stockService.getAnnotatedStockOrdersAll()
        this.webVouchersObservable = this.voucherService.getAnnotatedUsedVouchersByDate()

        this.subscriptionState = this.navigationService.getStateObservable().subscribe(state => {
            this.state = state
        })
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })

        this.fridgeOrdersObservable = this.orderService.getAnnotatedFridgeOrders()

        this.route.queryParams.first().subscribe(queryParams => {
            this.initTabId = queryParams['tab'];
            this.stateInit()
        })

        this.dataStore.getLaboNameObservable().subscribe(res => {
            this.laboName = res
        })
    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionState.unsubscribe()
    }

    private fridgeOrdersObservable: Observable<any>;
    private suppliersObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private webVouchersObservable: Observable<any>;

    private stockOrdersObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionState: Subscription
}