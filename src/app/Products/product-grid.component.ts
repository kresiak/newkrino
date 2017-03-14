import {Component, Input, OnInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'
import { OrderService } from './../Shared/Services/order.service';

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
    @Input() path: string = 'products'

    private products;

    constructor(private orderService: OrderService)
    {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });        
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionProducts: Subscription 
    private otpListObservable: any
    
    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit() : void{
        this.otpListObservable = this.orderService.getAnnotatedOtps().map(otps => otps.map(otp => {
            return {
                id: otp.data._id,
                name: otp.data.name
            }
        }));        

        this.subscriptionProducts= Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (products, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '!' || txt === '$' || txt === '$>' || txt === '$<') return products;

            return products.filter(product => {
                if (txt.startsWith('$S/')) {
                    let txt2 = txt.slice(3);
                    return product.data.isStock && (!txt2 || product.data.name.toUpperCase().includes(txt2))                     
                }                
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