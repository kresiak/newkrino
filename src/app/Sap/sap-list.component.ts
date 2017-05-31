import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { SapService } from './../Shared/Services/sap.service'

@Component(
    {
        selector: 'gg-sap-list',
        templateUrl: './sap-list.component.html'
    }
)
export class SapListComponent implements OnInit {
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

    private nbHitsShown: number= 10
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)

    private saps;

    constructor(private sapService: SapService, private orderService: OrderService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionSaps = Observable.combineLatest(this.sapsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), 
            (saps, searchTxt: string) => {
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

                return sap.mainData.data.ourRef.toString().toUpperCase().includes(txt) ||sap.mainData.data.sapId.toString().toUpperCase().includes(txt) || sap.mainData.data.supplier.toUpperCase().includes(txt)
                    || sap.mainData.annotation.otpTxt.toUpperCase().includes(txt)
            })
        }).do(saps => {
            this.nbHits= saps.length
        })
        .switchMap(saps => {
            return this.nbHitsShownObservable.map(nbItems => {
                return saps.slice(0, nbItems)
            }) 
        }).switchMap(saps => {
            return this.orderService.getOrderEquipeInfoMap().map(orderMap => {
                return saps.map(sap => {
                    if (sap.mainData && sap.mainData.data.ourRef && +sap.mainData.data.ourRef && orderMap.has(+sap.mainData.data.ourRef)) {
                        var orderInfo= orderMap.get(+sap.mainData.data.ourRef)
                        sap.equipeInfo= orderInfo.annotation.equipe || orderInfo.annotation.equipeGroup
                        sap.extraEquipeInfo= orderInfo.annotation.equipeGroupRepartition
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
        this.nbHitsShown+= this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }


}