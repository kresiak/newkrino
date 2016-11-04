import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
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
    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit();
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliers();
        this.suppliersObservable.subscribe(suppliers => 
            this.suppliers = suppliers);
        //this.dataStore.getDataObservable('Suppliers');
    }

    getSupplierObservable(id: string): Observable<any> {
        return this.suppliersObservable.map(suppliers => suppliers.filter(s => s.data._id === id)[0].data);
    }

   // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState)
        {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }            
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId)
    {
            this.state[objectId]= newState;
            this.stateChanged.next(this.state);
    }}

