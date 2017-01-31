import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { SelectableData } from '../../Shared/Classes/selectable-data'
import {DataStore} from '../../Shared/Services/data.service'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-admin-ak',
        templateUrl: './component.html'
    }
)

export class AdminAK {
    constructor(private dataStore: DataStore) {
        this.dbCollections.push(new SelectableData('users.krino','users.krino'))
        this.dbCollections.push(new SelectableData('orders.vouchers','orders.vouchers'))
        this.dbCollections.push(new SelectableData('orders','orders'))
        this.dbCollections.push(new SelectableData('otps','otps'))
        this.dbCollections.push(new SelectableData('suppliers','suppliers'))
        this.dbCollections.push(new SelectableData('equipes','equipes'))
        this.dbCollections.push(new SelectableData('products','products'))
        this.dbCollections.push(new SelectableData('categories','categories'))
        this.dbCollections.push(new SelectableData('basket','basket'))
        this.dbCollections.push(new SelectableData('orders.reception','orders.reception'))
    }

    @Input() state;
    @Output() stateChanged = new EventEmitter()

    vouchersObservable: Observable<any>;
    vouchersReadyForSapObservable: Observable<any>;

    private stateInit() {
        if (!this.state) this.state = {}
        if (!this.state.selectedTabId) this.state.selectedTabId = ''
    }

    ngOnInit(): void {
        this.stateInit()
        this.dbCollectionsObservable= Observable.from([this.dbCollections])
    }

    public beforeTabChange($event: NgbTabChangeEvent) {        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
        
    private dbCollections: SelectableData[]= []
    private dbCollectionsObservable: Observable<SelectableData[]>
    private collectionSelected: string= 'orders'

    dbChanged(newid) {
        //this.dataStore.triggerDataNext(newid)
        this.collectionSelected= newid
   }

    refresh() {
        this.dataStore.triggerDataNext(this.collectionSelected)
    }
}