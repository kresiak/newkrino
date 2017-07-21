import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offer-list',
        templateUrl: './platform-offer-list.component.html'
    }
)
export class PlatformOfferListComponent implements OnInit {
    searchForm: FormGroup;
    searchControl = new FormControl();

    constructor() {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private state
    @Input() offersObservable: Observable<any>

    private isPageRunning: boolean = true

    private nbHitsShown: number = 10
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)


    private offersList: any

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit()

        Observable.combineLatest(this.offersObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (offers, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$') return offers
            return offers.filter(o => {
                if (txt.startsWith('$>') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + o.annotation.total >= montant;
                }
                if (txt.startsWith('$<') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + o.annotation.total <= montant;
                }
                return (o.data.description || '').toUpperCase().includes(txt) || (o.annotation.serviceTxt || '').toUpperCase().includes(txt) || (o.annotation.numero || '').toUpperCase().includes(txt)
                    || (o.annotation.client || '').toUpperCase().includes(txt) || (o.annotation.commercialStatus || '').toUpperCase().includes(txt)
            })
        }).do(offers => {
            this.nbHits = offers.length
        })
            .switchMap(offers => {
                return this.nbHitsShownObservable.map(nbItems => {
                    return offers.slice(0, nbItems)
                })
            }).takeWhile(() => this.isPageRunning).subscribe(offers => {
                if (!comparatorsUtils.softCopy(this.offersList, offers))
                    this.offersList = comparatorsUtils.clone(offers)
            })
    }

    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    };

    private moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }


}

