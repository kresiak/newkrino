import {Component, OnInit} from '@angular/core'
import {DataStore} from './../Shared/Services/data.service'
import {SupplierService} from './../Shared/Services/supplier.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './supplier-list.component.html'
 }
)
export class SupplierListComponent implements OnInit{
    constructor(private dataStore: DataStore, private supplierService: SupplierService)    {

    }

    suppliers: Observable<any>;

    ngOnInit():void{
        this.suppliers= this.supplierService.getAnnotatedSuppliers(); 
        //this.dataStore.getDataObservable('Suppliers');
    }

    getSupplierObservable(id: string) : Observable<any>
    {
        return this.suppliers.map(suppliers=> suppliers.filter(s => s.data._id===id)[0].data);
    }
}

