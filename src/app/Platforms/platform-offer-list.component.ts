import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
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

@Input() offersList

    ngOnInit(): void {}

}