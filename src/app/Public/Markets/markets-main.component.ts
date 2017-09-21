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
    private productsList: any[]

    constructor( private dataStore: DataStore) {
    }

    ngOnInit(): void {

        this.dataStore.getDataObservable('products.market').subscribe(productsList => {
            this.productsList= productsList
        })

    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}