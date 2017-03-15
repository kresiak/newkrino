import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';




@Component(
    {
        //moduleId: module.id,
        selector: 'gg-supplier-sap-list',
        templateUrl: './supplier-sap-list.component.html'
    }
)
export class SupplierSapListComponent implements OnInit {
    constructor(private dataStore: DataStore) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private suppliers; //: Observable<any>;
    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionSuppliers: Subscription   

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionSuppliers= Observable.combineLatest(this.dataStore.getDataObservable('sap.supplier'), this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (suppliers, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt==='$') return suppliers.slice(0, 200);

            return suppliers.filter(supplier => {
                return (supplier.name && supplier.name.toUpperCase().includes(txt)) || 
                    (supplier.city && supplier.city.toUpperCase().includes(txt)) || 
                    (supplier.country && supplier.country.toUpperCase().includes(txt)) || 
                    (supplier.sapId && supplier.sapId.toString().toUpperCase().includes(txt)) 
                    
            }).slice(0,200);
        }).subscribe(suppliers => {
            this.suppliers = suppliers
        });
    }

    ngOnDestroy(): void {
         this.subscriptionSuppliers.unsubscribe()
    }
    

    getSupplierObservable(id: string): Observable<any> {
        return this.dataStore.getDataObservable('sap.supplier').map(suppliers => 
        {
            let supplier= suppliers.filter(s => s._id === id)[0];
            return supplier ? supplier : null; 
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

