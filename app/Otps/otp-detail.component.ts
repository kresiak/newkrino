import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {DataStore} from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service';
import {UserService} from './../Shared/Services/user.service'
import { SelectableData } from './../Shared/Classes/selectable-data'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp-detail',
        templateUrl: './otp-detail.component.html'
    }
)
export class OtpDetailComponent implements OnInit
{
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private userService: UserService) {
            
    }

    ngOnInit():void 
    {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();  
        this.selectedCategoryIdsObservable = this.otpObservable.map(otp => otp.data.Categorie);
        this.otpObservable.subscribe(otp =>{
            this.otp=otp;
            this.ordersObservable= this.orderService.getAnnotedOrdersByOtp(otp.data._id);
            this.ordersObservable.subscribe(orders => this.anyOrder= orders && orders.length > 0);
        });
    }
    
    @Input() otpObservable : Observable<any>;
    private otp ;
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;
    
    categorySelectionChanged(selectedIds: string[]) {
        this.otp.data.Categorie = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    categoryHasBeenAdded(newCategory: string)
    {
        this.productService.createCategory(newCategory);
    }
    
    setDashlet(isChecked, dashletId)
    {
        if (isChecked) 
        {
            this.userService.createOtpDashletForCurrentUser(this.otp.data._id);
        }
        else
        {
            if (dashletId) 
                this.userService.removeDashletForCurrentUser(dashletId);
        }        
    }
}