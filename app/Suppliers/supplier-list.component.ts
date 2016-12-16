import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        template: `<gg-supplier-list [suppliersObservable]= "suppliersObservable"></gg-supplier-list>`
    }
)
export class SupplierListComponentRoutable implements OnInit {
    constructor(private supplierService: SupplierService) { }

    ngOnInit(): void {
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
    }

    private suppliersObservable: Observable<any>;
}


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-list',
        templateUrl: './supplier-list.component.html'
    }
)
export class SupplierListComponent implements OnInit {
    constructor(private dataStore: DataStore, private supplierService: SupplierService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private suppliers; //: Observable<any>;
    @Input() suppliersObservable: Observable<any>;
    @Input() state;
    @Input() initialTabInSupplierDetail: string = '';
    @Output() stateChanged= new EventEmitter();


    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;

    ngOnInit(): void {
        this.stateInit();

        Observable.combineLatest(this.suppliersObservable, this.searchControl.valueChanges.startWith(''), (suppliers, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '') return suppliers;

            return suppliers.filter(supplier => {
                return (supplier.data.name && supplier.data.name.toUpperCase().includes(txt)) || 
                    (supplier.data.city && supplier.data.city.toUpperCase().includes(txt)) || 
                    (supplier.data.country && supplier.data.country.toUpperCase().includes(txt)) || 
                    (supplier.data.client && supplier.data.client.toUpperCase().includes(txt))
            });
        }).subscribe(suppliers => {
            this.suppliers = suppliers
        });
    }

    getSupplierObservable(id: string): Observable<any> {
        return this.suppliersObservable.map(suppliers => 
        {
            let supplier= suppliers.filter(s => s.data._id === id)[0];
            return supplier ? supplier.data : null; 
        } );
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

