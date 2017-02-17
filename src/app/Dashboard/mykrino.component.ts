import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {ProductService} from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import {DataStore} from './../Shared/Services/data.service'
import {Observable, Subscription} from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'


@Component(
 {
     //moduleId: module.id,
     templateUrl: './mykrino.component.html'
 }
)
export class MyKrinoComponent implements OnInit{
    constructor(private orderService: OrderService, private productService: ProductService, private authService: AuthService, private dataStore: DataStore,
                private supplierService: SupplierService)    {}

    ordersObservable: Observable<any>;
    stockOrdersObservable: Observable<any>;
    productsObservable: Observable<any>;
    webSuppliersObservable: Observable<any>
    webVouchersObservable: Observable<any>
    suppliersWithBasketObservable: Observable<any>;
    currentUser;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription 
    private subscriptionCurrentUser: Subscription


    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }    
    

    ngOnInit():void{
        this.stateInit();
        this.suppliersWithBasketObservable= this.supplierService.getAnnotatedSuppliers().map(suppliers => suppliers.filter(supplier => supplier.annotation.hasBasket));
        this.ordersObservable= this.orderService.getAnnotedOrdersOfCurrentUser();

        this.stockOrdersObservable= this.productService.getAnnotatedStockOrdersByCurrentUser()

        this.productsObservable= this.productService.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo();
        this.subscriptionCurrentUser= this.authService.getAnnotatedCurrentUser().subscribe(res => {
            this.currentUser= res;
        });
        this.webSuppliersObservable= this.supplierService.getAnnotatedWebSuppliers()

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
        this.webVouchersObservable= this.productService.getAnnotatedUsedVouchersOfCurrentUserByDate()
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionCurrentUser.unsubscribe()
    }
    

   commentsUpdated(comments)
    {
        if (this.currentUser && comments)
        {
            this.currentUser.data.notes= comments;
            this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
        }        
    }    

   public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

   // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId)
    {
            this.state[objectId]= newState;
            this.stateChanged.next(this.state);
    }    

    private childOrdersStateChanged($event)
    {
        this.state.Orders= $event;
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


}

