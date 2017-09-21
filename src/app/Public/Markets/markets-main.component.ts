import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'

@Component(
    {
        selector: 'gg-markets-main',
        templateUrl: './markets-main.component.html'
    }
)
export class MarketsMainComponent implements OnInit {
    isPageRunning: boolean= true;

    constructor() {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}