import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {DataStore} from './../Shared/Services/data.service'
import { SelectableData } from './../ui/selector/selectable-data'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp',
        templateUrl: './otp.component.html'
    }
)
export class OtpComponent implements OnInit
{
    constructor(private dataStore: DataStore) {
        this.selectableDataObservable = this.dataStore.getDataObservable('Categories').map(categories => {
            return categories.map(category =>
                new SelectableData(category._id, category.Description)
            )
        });        
    }

    ngOnInit():void 
    {
        this.selectedDataObservable = this.otpObservable.map(otp => otp.Categorie);
        this.otpObservable.subscribe(otp => this.otp=otp);
    }
    
    @Input() otpObservable : Observable<any>;
    private otp ;
    private selectableDataObservable: Observable<any>;
    private selectedDataObservable: Observable<any>;
    
    categorySelectionChanged(selectedIds: string[]) {
        this.otp.Categorie = selectedIds;
        this.dataStore.updateData('otps', this.otp._id, this.otp);
    }

    categoryHasBeenAdded(newCategory: string)
    {
        this.dataStore.addData('Categories', {'Description': newCategory});
    }
    
}