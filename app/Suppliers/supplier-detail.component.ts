import {Component, Input, OnInit} from '@angular/core';
import {DataStore} from './../Shared/Services/data.service'
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
    constructor(private dataStore: DataStore)    {}

    ngOnInit(): void{
        this.supplierObservable.subscribe(supplier => 
        {
            this.supplier= supplier;
            this.productsObservable= this.dataStore.getDataObservable('Produits').map(produits => produits.filter(produit => produit.Supplier===supplier._id));
        });
    }

    @Input() supplierObservable: Observable<any>;
    private productsObservable: Observable<any>;
    private supplier: any;
}