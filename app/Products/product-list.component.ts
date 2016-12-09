import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        template: `<gg-product-list [productsObservable]= "productsObservable"></gg-product-list>`
    }
)
export class ProductListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.productsObservable = this.orderService.getAnnotatedProducts();
    }

    private productsObservable: Observable<any>;
}


@Component(
    {
        moduleId: module.id,
        selector: 'gg-product-list',
        templateUrl: './product-list.component.html'
    }
)
export class ProductListComponent implements OnInit {
    @Input() productsObservable: Observable<any>;
    @Input() config;
    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    

    private products;

    constructor() {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    ngOnInit(): void {
        this.stateInit();
        
        
        Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.startWith(''), (products, searchTxt: string) => {
            if (searchTxt.trim() === '') return products;
            return products.filter(product => product.data.name.toUpperCase().includes(searchTxt.toUpperCase()) 
                                    || product.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(products => this.products = products);
    }

    getProductObservable(id: string) {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState)
        {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }            
    };
    
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId)
    {
            this.state[objectId]= newState;
            this.stateChanged.next(this.state);
    }

}