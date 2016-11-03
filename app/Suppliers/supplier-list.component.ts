import { Component, OnInit } from '@angular/core'
import { DataStore } from './../Shared/Services/data.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        moduleId: module.id,
        templateUrl: './supplier-list.component.html'
    }
)
export class SupplierListComponent implements OnInit {
    constructor(private dataStore: DataStore, private supplierService: SupplierService) {

    }

    private suppliers; //: Observable<any>;
    private suppliersObservable: Observable<any>;


    ngOnInit(): void {
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliers();
        this.suppliersObservable.subscribe(suppliers => 
            this.suppliers = suppliers);
        //this.dataStore.getDataObservable('Suppliers');
    }

    getSupplierObservable(id: string): Observable<any> {
        return this.suppliersObservable.map(suppliers => suppliers.filter(s => s.data._id === id)[0].data);
    }

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    private openPanelId: string= "";
    public beforePanelChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) 
            this.openPanelId= $event.panelId;
    };


    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private openSupplierTabs= {};
    supplierDetailTabChanged(tabId, supplierId)
    {
        this.openSupplierTabs[supplierId]= tabId;
    }
}

