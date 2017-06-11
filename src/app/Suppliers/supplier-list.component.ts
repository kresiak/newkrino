import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { ConfigService } from './../Shared/Services/config.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-supplier-list',
        templateUrl: './supplier-list.component.html'
    }
)
export class SupplierListComponent implements OnInit {
    constructor(private dataStore: DataStore, private supplierService: SupplierService, private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private suppliers = []; //: Observable<any>;
    @Input() suppliersObservable: Observable<any>;
    @Input() state;
    @Input() path: string = 'suppliers'
    @Input() initialTabInSupplierDetail: string = '';
    @Output() stateChanged = new EventEmitter();


    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    private listName= 'supplierList'
    private showSearch: boolean= false
    

    private supplierIdsSetWithBasketForCurrentUser: Set<string> = new Set<string>()

    private nbHitsShown: number= 10
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)
    private isPageRunning: boolean = true

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    setBasketInformation() {
        this.suppliers.forEach(supplier => {
            supplier.annotation.hasBasket = this.supplierIdsSetWithBasketForCurrentUser.has(supplier.data._id)
        })
    }

    ngOnInit(): void {
        this.stateInit();
        var initialSearch= this.configService.listGetSearchText(this.listName)
        if (initialSearch){ 
            this.showSearch= true
            this.searchControl.setValue(initialSearch)
        }
        this.nbHitsShownObservable.next(this.nbHitsShown= this.configService.listGetNbHits(this.listName, this.nbHitsShown))
        

        Observable.combineLatest(this.suppliersObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch), (suppliers, searchTxt: string) => {
            this.configService.listSaveSearchText(this.listName, searchTxt)
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$') return suppliers;

            if (txt.toUpperCase().startsWith('$W')) return suppliers.filter(supplier => supplier.data.webShopping && supplier.data.webShopping.isEnabled)

            return suppliers.filter(supplier => {
                return (supplier.data.name && supplier.data.name.toUpperCase().includes(txt)) ||
                    (supplier.data.city && supplier.data.city.toUpperCase().includes(txt)) ||
                    (supplier.data.country && supplier.data.country.toUpperCase().includes(txt)) ||
                    (supplier.data.oldId && supplier.data.oldId.toString().toUpperCase().includes(txt)) ||
                    (supplier.data.sapId && supplier.data.sapId.toString().toUpperCase().includes(txt))

            });
        }).do(suppliers => {
            this.nbHits= suppliers.length
        })
        .switchMap(suppliers => {
            return this.nbHitsShownObservable.map(nbItems => {
                return suppliers.slice(0, nbItems)
            })
        }).takeWhile(() => this.isPageRunning).subscribe(suppliers => {
            if (!comparatorsUtils.softCopy(this.suppliers, suppliers))
            {
                this.suppliers= comparatorsUtils.clone(suppliers)
            }
            this.setBasketInformation()
        });


        this.supplierService.getSupplierIdsSetObservableWithBasketForCurrentUser().takeWhile(() => this.isPageRunning).subscribe(idsSet => {
            this.supplierIdsSetWithBasketForCurrentUser = idsSet
            this.setBasketInformation()
        })
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private moreHits() {
        this.nbHitsShown+= this.nbHitsIncrement
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)        
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }
}

