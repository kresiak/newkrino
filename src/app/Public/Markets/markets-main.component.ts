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
    productsObservable: Observable<any[]>;
    isPageRunning: boolean = true;
    private productsList: any[]


    constructor(private dataStore: DataStore) {
    }

    fnFilterProduct(product, txt) {
        return (product.name.toUpperCase().includes(txt.toUpperCase())
            || product.catalogNr.toUpperCase().includes(txt.toUpperCase())
            || product.supplier.toUpperCase().includes(txt.toUpperCase())
            || product.package.toUpperCase().includes(txt.toUpperCase())
        )
    }

    ngOnInit(): void {
        this.productsObservable = this.dataStore.getDataObservable('products.market')
        /*        this.dataStore.getDataObservable('products.market').subscribe(productsList => {
                    this.productsList= productsList
                })
        */
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}