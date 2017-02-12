import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ProductService } from './../Shared/Services/product.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';




@Component(
    {
        //moduleId: module.id,
        selector: 'gg-stock-list',
        templateUrl: './stock-list.component.html'
    }
)
export class StockListComponent implements OnInit {
    constructor() {

    }

    private products; //: Observable<any>;
    @Input() productsObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged= new EventEmitter();


    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit();
        this.productsObservable.subscribe(products => 
            this.products = products);
    }

    getProductObservable(id: string): Observable<any> {
        return this.productsObservable.map(products => 
        {
            let product= products.filter(s => s.key === id)[0];
            return product; 
        } );
    }

    nbAvailable(product){
        return product.values.reduce((acc, b)=> acc + b.annotation.nbAvailable, 0);
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
    }}

