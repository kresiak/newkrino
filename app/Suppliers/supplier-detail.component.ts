import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from './../Shared/Services/api.service'
import {Observable} from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit
{
    constructor(private apiService: ApiService)    {}

    ngOnInit(): void{
        Observable.forkJoin([
            this.apiService.crudGetRecord('Suppliers', this.supplierId), this.apiService.crudGetRecords("Produits")
        ]).subscribe(
            data =>
            {
                this.supplier= data[0];
                this.supplier.products=data[1].filter(supplier => supplier.Supplier === this.supplierId);   
            }
        );
    }

    @Input() supplierId;
    supplier:any;    
}