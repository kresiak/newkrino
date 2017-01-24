import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {ProductService} from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import {AuthService} from './../Shared/Services/auth.service'
import {DataStore} from './../Shared/Services/data.service'
import {Observable} from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
 {
     moduleId: module.id,
     templateUrl: './mykrino.component.html'
 }
)
export class MyKrinoComponent implements OnInit{
    constructor(private orderService: OrderService, private productService: ProductService, private authService: AuthService, private dataStore: DataStore,
                private supplierService: SupplierService)    {}

    ordersObservable: Observable<any>;
    productsObservable: Observable<any>;
    equipesObservable: Observable<any>;
    webSuppliersObservable: Observable<any>
    suppliersWithBasketObservable: Observable<any>;
    currentUser;

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
        this.productsObservable= this.productService.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo();
        this.authService.getAnnotatedCurrentUser().subscribe(res => {
            this.currentUser= res;
        });
        this.equipesObservable= this.orderService.getAnnotatedEquipesOfCurrentUser();
        this.webSuppliersObservable= this.supplierService.getAnnotatedWebSuppliers()
    }

   commentsUpdated(comments)
    {
        if (this.currentUser && comments)
        {
            this.currentUser.data.notes= comments;
            this.dataStore.updateData('users.krino', this.currentUser.data._id, this.currentUser.data);
        }        
    }    

   getEquipeObservable(id: string) : Observable<any>
    {
        return this.equipesObservable.map(equipes=> equipes.filter(s => s.data._id===id)[0]);
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


}

