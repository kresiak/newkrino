import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offer-list',
        templateUrl: './platform-offer-list.component.html'
    }
)
export class PlatformOfferListComponent implements OnInit {

    constructor() {
    }

    private state
    @Input() offersObservable: Observable<any>

    private isPageRunning: boolean = true

    private offersList: any

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    fnFilter(o, txt) {
        if (txt === '' || txt === '$') return true
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
    }


    ngOnInit(): void {
        this.stateInit()
    }

    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };

    ngOnDestroy(): void {
        this.isPageRunning = false
    }
}

