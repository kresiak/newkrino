import {Component, Input, OnInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-grid',
        templateUrl: './product-grid.component.html'
    }
)
export class ProductGridComponent implements OnInit
{
    @Input() productsObservable: Observable<any>;
    @Input() config;

    private products;

    constructor()
    {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });        
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionProducts: Subscription 
    

    ngOnInit() : void{

        this.subscriptionProducts= Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.startWith(''), (products, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '!' || txt === '$' || txt === '$>' || txt === '$<') return products;

            return products.filter(product => {
                if (txt.startsWith('!')) {
                    let txt2 = txt.slice(1);
                    return !product.data.name.toUpperCase().includes(txt2) && !product.annotation.supplierName.toUpperCase().includes(txt2)
                }
                if (txt.startsWith('$>') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + product.data.price >= montant;
                }
                if (txt.startsWith('$<') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + product.data.price <= montant;
                }

                return product.data.name.toUpperCase().includes(txt) 
            });
        }).subscribe(products => {
            this.products = products.slice(0, 30)
        });
    }

    ngOnDestroy(): void {
         this.subscriptionProducts.unsubscribe()
    }


    getProductObservable(id: string) : Observable<any>
    {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

/*    getProductObservable(id: string): Observable<any> {
        return this.productsObservable.map(products => products.filter(product => product._id === id)[0]);
    }*/
}