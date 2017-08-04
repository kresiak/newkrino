import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { ConfigService } from './../Shared/Services/config.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { SapService } from './../Shared/Services/sap.service'
import * as comparatorsUtils from './../Shared/Utils/comparators'
import * as moment from "moment"

enum SortKey {
    No = 0,
    SapId = 1,
    OurRef = 2,
    EngagDate = 3,
    LastDate = 4,

}

@Component(
    {
        selector: 'gg-sap-list',
        templateUrl: './sap-list.component.html'
    }
)
export class SapListComponent implements OnInit {
    SortKey: typeof SortKey = SortKey;        // Necessary: see https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates  

    @Input() sapsObservable: Observable<any>;
    @Input() state;
    @Input() path: string = 'saps'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionSaps: Subscription

    private nbHitsShown: number = 10
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)

    private isReverse: boolean= false
    private isReverseObservable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isReverse)

    private sortKey: SortKey= SortKey.No
    private sortKeyObservable: BehaviorSubject<SortKey> = new BehaviorSubject<SortKey>(this.sortKey)

    private saps;

    private listName = 'sapList'
    private showSearch: boolean = false


    constructor(private sapService: SapService, private orderService: OrderService, private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();
        var initialSearch = this.configService.listGetSearchText(this.listName)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }
        this.nbHitsShownObservable.next(this.nbHitsShown = this.configService.listGetNbHits(this.listName, this.nbHitsShown))

        this.subscriptionSaps = Observable.combineLatest(this.sapsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch),
            (saps, searchTxt: string) => {
                this.configService.listSaveSearchText(this.listName, searchTxt)
                let txt: string = searchTxt.trim().toUpperCase();

                if (txt === '' || txt === '$' || txt === '#') return saps

                return saps.filter(sap => {
                    if (txt.startsWith('$F')) {
                        return sap.hasFactureFinale;
                    }
                    if (txt.startsWith('$D')) {
                        return sap.isSuppr;
                    }
                    if (txt.startsWith('$T')) {
                        return +sap.residuEngaged < 0.05;
                    }
                    if (txt.startsWith('$O')) {
                        return +sap.residuEngaged >= 0.05;
                    }
                    if (txt.startsWith('$P')) {
                        let typ = txt.slice(2);
                        if (typ.length === 2) {
                            return sap.factured && sap.factured.data.isNoEngag && sap.typesPiece.toUpperCase().includes(typ);
                        }
                        return sap.factured && sap.factured.data.isNoEngag;
                    }
                    if (txt.startsWith('$EO')) {
                        return sap.hasOtpError;
                    }

                    if (txt.startsWith('$E>') && +txt.slice(3)) {
                        let montant = +txt.slice(3);
                        return + sap.residuEngaged >= montant;
                    }
                    if (txt.startsWith('$E<') && +txt.slice(3)) {
                        let montant = +txt.slice(3);
                        return + sap.residuEngaged && + sap.residuEngaged <= montant;
                    }
                    if (txt.startsWith('$R>') && +txt.slice(3)) {
                        let montant = +txt.slice(3);
                        return + sap.alreadyBilled >= montant;
                    }
                    if (txt.startsWith('$R<') && +txt.slice(3)) {
                        let montant = +txt.slice(3);
                        return + sap.alreadyBilled && + sap.residuEngaged <= montant;
                    }
                    if (txt.startsWith('#>') && +txt.slice(2)) {
                        let montant = +txt.slice(2);
                        return sap.engaged && sap.engaged.data.items.length > montant
                    }
                    if (txt.startsWith('#<') && +txt.slice(2)) {
                        let montant = +txt.slice(2);
                        return sap.engaged && sap.engaged.data.items.length < montant
                    }
                    if (txt.startsWith('#=') && +txt.slice(2)) {
                        let montant = +txt.slice(2);
                        return sap.engaged && sap.engaged.data.items.length == montant
                    }

                    return sap.mainData.data.ourRef.toString().toUpperCase().includes(txt) || sap.mainData.data.sapId.toString().toUpperCase().includes(txt) || sap.mainData.data.supplier.toUpperCase().includes(txt)
                        || sap.mainData.annotation.otpTxt.toUpperCase().includes(txt)
                })
            }).do(saps => {
                this.nbHits = saps.length
            })
            .switchMap(saps => {
                var sapsCopy= comparatorsUtils.clone(saps)
                return this.sortKeyObservable.map(sortKey => {
                    switch(sortKey){
                        case SortKey.No: {
                            return saps
                        }
                        case SortKey.SapId: {
                            return sapsCopy.sort((a, b) => {
                                return a.mainData.data.sapId <= b.mainData.data.sapId ? 1 : -1
                            })
                        }
                        case SortKey.OurRef: {
                            return sapsCopy.sort((a, b) => {                                
                                return a.mainData.data.ourRef < b.mainData.data.ourRef ? 1 : 
                                        (a.mainData.data.ourRef > b.mainData.data.ourRef ? -1 : (a.mainData.data.sapId <= b.mainData.data.sapId ? 1 : -1))
                            })
                        }
                        case SortKey.EngagDate: {
                            return sapsCopy.sort((a, b) => {                                
                                var d1 = moment(a.engaged ? a.engaged.data.maxDate : '01/01/1970', 'DD/MM/YYYY HH:mm:ss').toDate()
                                var d2 = moment(b.engaged ? b.engaged.data.maxDate : '01/01/1970', 'DD/MM/YYYY HH:mm:ss').toDate()                                

                                return d1 < d2 ? 1 : (d1 > d2 ? -1 : (a.mainData.data.sapId <= b.mainData.data.sapId ? 1 : -1))
                            })
                        }
                        case SortKey.LastDate: {
                            return sapsCopy.sort((a, b) => {                                
                                var d1 = moment(a.dateLastActivity ? a.dateLastActivity : '01/01/1970', 'DD/MM/YYYY HH:mm:ss').toDate()
                                var d2 = moment(b.dateLastActivity ? b.dateLastActivity : '01/01/1970', 'DD/MM/YYYY HH:mm:ss').toDate()                                

                                return d1 < d2 ? 1 : (d1 > d2 ? -1 : (a.mainData.data.sapId <= b.mainData.data.sapId ? 1 : -1))
                            })
                        }
                    }
                })
            })
            .switchMap(saps => {
                var sapsCopy= comparatorsUtils.clone(saps)
                return this.isReverseObservable.map(isReverse => {
                    return isReverse ? sapsCopy.reverse() : saps
                })
            })
            .switchMap(saps => {
                return this.nbHitsShownObservable.map(nbItems => {
                    return saps.slice(0, nbItems)
                })
            }).switchMap(saps => {
                return this.orderService.getOrderEquipeInfoMap().map(orderMap => {
                    return saps.map(sap => {
                        if (sap.mainData && sap.mainData.data.ourRef && +sap.mainData.data.ourRef && orderMap.has(+sap.mainData.data.ourRef)) {
                            var orderInfo = orderMap.get(+sap.mainData.data.ourRef)
                            sap.equipeInfo = orderInfo.annotation.equipe || orderInfo.annotation.equipeGroup
                            sap.extraEquipeInfo = orderInfo.annotation.equipeGroupRepartition
                        }
                        return sap
                    })
                })
            }).subscribe(saps => this.saps = saps);
    }

    ngOnDestroy(): void {
        this.subscriptionSaps.unsubscribe()
    }

    getSapObservable(sapId: number) {
        return this.sapService.getSapItemObservable(sapId)
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

    /*    private getOtpText(sapInfo) {
            var arr=  Array.from(sapInfo.mainData.annotation.otpMap.keys())
            return arr.length === 0 ? 'no OTP' : arr.reduce((a, b) => a + ', ' + b)
        }*/

    private moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    private reverseHits() {
        this.isReverse = ! this.isReverse
        this.isReverseObservable.next(this.isReverse)
    }

    private setSortKey(sortKey: SortKey) {        
        this.sortKey= sortKey === this.sortKey ? SortKey.No : sortKey
        this.sortKeyObservable.next(this.sortKey)
    }

    private isSortKeySet(sortKey: SortKey) {
        return this.sortKey === sortKey
    }
}