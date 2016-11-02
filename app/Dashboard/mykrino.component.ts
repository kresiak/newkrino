import {Component, OnInit} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {ProductService} from './../Shared/Services/product.service'
import {AuthService} from './../Shared/Services/auth.service'
import {DataStore} from './../Shared/Services/data.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './mykrino.component.html'
 }
)
export class MyKrinoComponent implements OnInit{
    constructor(private orderService: OrderService, private productService: ProductService, private authService: AuthService, private dataStore: DataStore)    {}

    ordersObservable: Observable<any>;
    productsObservable: Observable<any>;
    equipesObservable: Observable<any>;
    currentUser;

    ngOnInit():void{
        this.ordersObservable= this.orderService.getAnnotedOrdersOfCurrentUser();
        this.productsObservable= this.productService.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo();
        this.authService.getAnnotatedCurrentUser().subscribe(res => {
            this.currentUser= res;
        });
        this.equipesObservable= this.orderService.getAnnotatedEquipesOfCurrentUser();
    }

   commentsUpdated(comments)
    {
        if (this.currentUser && comments)
        {
            this.currentUser.data.notes= comments;
            this.dataStore.updateData('krinousers', this.currentUser.data._id, this.currentUser.data);
        }        
    }    

   getEquipeObservable(id: string) : Observable<any>
    {
        return this.equipesObservable.map(equipes=> equipes.filter(s => s.data._id===id)[0]);
    }    

}

