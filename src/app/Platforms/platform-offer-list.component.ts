import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offer-list',
        templateUrl: './platform-offer-list.component.html'
    }
)
export class PlatformOfferListComponent implements OnInit {
    constructor () {
    }
private state
@Input() offersList

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit()
    }

    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };

}

