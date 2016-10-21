import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-product-list',
        templateUrl: './product-list.component.html'
    }
)
export class ProductListComponent implements OnInit
{
    @Input() productsObservable: Observable<any>;
    @Input() config;

    private products;

    constructor()
    {
        
    }

    ngOnInit() : void{
        this.productsObservable.subscribe(products =>
            {
                this.products= products;
            }
        );
    }

    getProductObservable(id: string) : Observable<any>
    {
        return this.productsObservable.map(products => products.filter(product => product._id === id)[0]);
    }

/*    getProductObservable(id: string): Observable<any> {
        return this.productsObservable.map(products => products.filter(product => product._id === id)[0]);
    }*/
}