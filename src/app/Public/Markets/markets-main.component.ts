import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { AuthAnoynmousService } from './../../Shared/Services/auth-anonymous.service'


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


    constructor(private dataStore: DataStore, private authAnoynmousService: AuthAnoynmousService) {
    }

    fnFilterProduct(product, txt) {
        return product.data.name.toUpperCase().includes(txt.toUpperCase())
            || product.data.package.toUpperCase().includes(txt.toUpperCase())
            || (product.data.items || []).map(i => (i.supplier || '').toUpperCase()).filter(supplier => supplier.includes(txt.toUpperCase())).length > 0
            || (product.data.items || []).map(i => (i.catalogNr || '').toUpperCase()).filter(nr => nr.includes(txt.toUpperCase())).length > 0        
    }

    

    ngOnInit(): void {
        this.productsObservable = Observable.combineLatest(this.dataStore.getDataObservable('products.market'), this.authAnoynmousService.getAnnotatedUsers(), (products, users) => {
            return products.map(product => {
                return {
                    data: product,
                    annotation: {
                        suppliersTxt: product.items.reduce((acc, i2) => acc + (acc ? ', ': '') + i2.supplier, ''),
                        catNrTxt: product.items.reduce((acc, i2) =>  acc + ((acc && i2.catalogNr) ? ', ': '') + i2.catalogNr, ''),
                        items: product.items.map(item => {
                            var theUser= users.filter(u => u.data._id === item.userId)[0]
                            return {
                                data: item,
                                annotation: {
                                    user: theUser ? theUser.annotation.fullName : 'unknown user'
                                }
                            }
                        })
                    }
                }
            })
        })
        //this.productsObservable = this.dataStore.getDataObservable('products.market') //.map(products => products.map())
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    deleteDocument(product, itemPos, docPos) {
        product.data.items[itemPos].documents.splice(docPos, 1)
        this.dataStore.updateData('products.market', product.data._id, product.data)
    }

}