import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service'
import { DataStore } from './../Shared/Services/data.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-list',
        templateUrl: './product-list.component.html'
    }
)
export class ProductListComponent implements OnInit {
    @Input() productsObservable: Observable<any>;
    @Input() config;
    @Input() state;
    @Input() path: string = 'products'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;


    private products;

    constructor(private dataStore: DataStore, private authService: AuthService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private authorizationStatusInfo: AuthenticationStatusInfo

    ngOnInit(): void {
        this.stateInit();

        Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.startWith(''), (products, searchTxt: string) => {
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

                return product.data.name.toUpperCase().includes(txt) || product.annotation.supplierName.toUpperCase().includes(txt)
            });
        }).subscribe(products => {
            this.products = products.slice(0, 250)
        });

        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        

    }

    getProductObservable(id: string) {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private saveFrigoProperty(event, product, isFrigo: boolean) {
        event.preventDefault()
        event.stopPropagation()
        product.data.isFrigo = isFrigo;
        this.dataStore.updateData('products', product.data._id, product.data);
    }
}