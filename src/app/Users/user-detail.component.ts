import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { ConfigService } from './../Shared/Services/config.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { OrderService } from './../Shared/Services/order.service'
import { VoucherService } from '../Shared/Services/voucher.service';
import { StockService } from '../Shared/Services/stock.service';
import { EquipeService } from '../Shared/Services/equipe.service';


@Component(
    {
        selector: 'gg-user-detail',
        templateUrl: './user-detail.component.html'
    }
)

export class UserDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService, private navigationService: NavigationService, private orderService: OrderService, 
                private voucherService: VoucherService, private equipeService: EquipeService, private stockService: StockService, private configService: ConfigService) {
    }

    @Input() userObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean= false
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
         this.subscriptionUser=this.userObservable.subscribe(user => {
            if (!user) return
            this.user = user;
            this.equipesObservable= this.equipeService.getAnnotatedEquipesOfUser(user.data._id)
            this.ordersObservable = this.orderService.getAnnotedOrdersByUser(user.data._id)
            this.fridgeOrdersObservable= this.orderService.getAnnotatedFridgeOrdersByUser(user.data._id)
            this.stockOrdersObservable= this.stockService.getAnnotatedStockOrdersByUser(user.data._id)
            this.webVouchersObservable= this.voucherService.getAnnotatedUsedVouchersOfUserByDate(user.data._id)
        });
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
    };

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionUser.unsubscribe()
    }
    
    private user
    private webVouchersObservable: Observable<any>
    private stockOrdersObservable: Observable<any>;    
    private equipesObservable: Observable<any>
    private ordersObservable: Observable<any>
    private fridgeOrdersObservable: Observable<any>
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     
    private subscriptionUser: Subscription         

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/user', this.user.data._id, this.path, this.isRoot)
            return
        }
        if ($event.nextId === 'gotoTop') {
            $event.preventDefault();
            this.navigationService.jumpToTop()
            return
        }        
        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childEquipesStateChanged($event) {
        this.state.Equipes = $event;
        this.stateChanged.next(this.state);
    }

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    private childStockOrdersStateChanged($event) {
        this.state.StockOrders = $event;
        this.stateChanged.next(this.state);
    }

    isBlockedUpdated(isBlocked) {
        this.user.data.isBlocked = isBlocked;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    isLaboUserUpdated(isLabo) {
        this.user.data.isLaboUser = isLabo;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    isAdminUpdated(isAdmin) {
        this.user.data.isAdmin = isAdmin;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    commentsUpdated(comments) {
        if (this.user && comments) {
            this.user.data.comments = comments;
            this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
        }
    };

    isReceptionistUpdated(receptionist) {
        this.user.data.isReceptionist = receptionist;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    }

    isLabManagerUpdated(labManager) {
        this.user.data.isLabManager = labManager;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    }

    isProgrammerUpdated(isProgrammer) {
        this.user.data.isProgrammer = isProgrammer;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    }

    isPlatformAdminUpdated(isPlatformAdmin) {
        this.user.data.isPlatformAdmin = isPlatformAdmin;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    }

    isPassiveUserUpdated(isPassiveUser) {
        this.user.data.isPassiveUser = isPassiveUser;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    }

}