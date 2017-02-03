import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {DataStore} from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { SelectableData } from './../Shared/Classes/selectable-data'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-otp',
        templateUrl: './otp.component.html'
    }
)
export class OtpComponent implements OnInit
{
    constructor(private dataStore: DataStore, private productService: ProductService) {
            
    }

    ngOnInit():void 
    {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();  
        this.selectedCategoryIdsObservable = this.otpObservable.map(otp => otp.data.categoryIds);
        this.otpObservable.subscribe(otp => this.otp=otp);
    }
    
    @Input() otpObservable : Observable<any>;
    private otp ;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    
    categorySelectionChanged(selectedIds: string[]) {
        this.otp.data.categoryIds = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    categoryHasBeenAdded(newCategory: string)
    {
        this.productService.createCategory(newCategory);
    }
    
}