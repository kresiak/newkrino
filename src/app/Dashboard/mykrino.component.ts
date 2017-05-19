import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { ProductService } from './../Shared/Services/product.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { DataStore } from './../Shared/Services/data.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'


@Component(
    {
        //moduleId: module.id,
        templateUrl: './mykrino.component.html'
    }
)
export class MyKrinoComponent implements OnInit {
    constructor(private orderService: OrderService, private productService: ProductService, private authService: AuthService, private dataStore: DataStore,
        private supplierService: SupplierService, private navigationService: NavigationService) { }

    private ordersObservable: Observable<any>;
    private fridgeOrdersObservable: Observable<any>;
    private stockOrdersObservable: Observable<any>;
    private productsObservable: Observable<any>;
    private webSuppliersObservable: Observable<any>
    private webVouchersObservable: Observable<any>

    private suppliersWithBasketObservable: Observable<any>;
    private suppliersWithNonUrgentBasketObservable: Observable<any>;


    private equipesObservable: Observable<any>
    private currentUser;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionCurrentUser: Subscription
    private subscriptionState: Subscription     


    @Input() state;
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }


    ngOnInit(): void {
        this.stateInit();

        this.subscriptionState= this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        
        this.suppliersWithBasketObservable = this.supplierService.getAnnotatedSupplierseWithBasketForCurrentUser()

        this.suppliersWithNonUrgentBasketObservable = this.supplierService.getAnnotatedSupplierseWithCurrentUserParticipationInGroupsOrder()

        this.ordersObservable = this.orderService.getAnnotedOrdersOfCurrentUser();

        this.stockOrdersObservable = this.productService.getAnnotatedStockOrdersByCurrentUser()

        this.fridgeOrdersObservable = this.orderService.getAnnotatedFridgeOrdersByCurrentUser()

        this.productsObservable = this.productService.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo();
        this.subscriptionCurrentUser = this.authService.getAnnotatedCurrentUser().subscribe(res => {
            this.currentUser = res;
        });
        this.webSuppliersObservable = this.supplierService.getAnnotatedWebSuppliers()

        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
            this.equipesObservable= this.orderService.getAnnotatedEquipesOfUser(statusInfo.currentUserId)
        });
        this.webVouchersObservable = this.productService.getAnnotatedUsedVouchersOfCurrentUserByDate()
    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionCurrentUser.unsubscribe()
        this.subscriptionState.unsubscribe()
    }


    commentsUpdated(comments) {
        if (this.currentUser && comments) {
            this.currentUser.data.notes = comments;
            this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
        }
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    private childEquipesStateChanged($event) {
        this.state.Equipes = $event;
        this.stateChanged.next(this.state);
    }

    private childBasketsStateChanged($event) {
        this.state.Baskets = $event;
        this.stateChanged.next(this.state);
    }
    private childNonUrgentBasketsStateChanged($event) {
        this.state.NonUrgentBaskets = $event;
        this.stateChanged.next(this.state);
    }



    private childProductsStateChanged($event) {
        this.state.Products = $event;
        this.stateChanged.next(this.state);
    }    


    firstNameUpdated(firstName) {
        this.currentUser.data.firstName = firstName;
        this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
    };

    nameUpdated(name) {
        this.currentUser.data.name = name;
        this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
    };

    emailUpdated(email) {
        this.currentUser.data.email = email;
        this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
    };

    passwordUpdated(password) {
        this.currentUser.data.password = password;
        this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
    };

}

