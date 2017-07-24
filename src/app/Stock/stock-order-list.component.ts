import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ProductService } from './../Shared/Services/product.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from './../Shared/Services/config.service'
import { FormControl, FormGroup } from '@angular/forms'
import * as comparatorsUtils from './../Shared/Utils/comparators'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-stock-order-list',
        templateUrl: './stock-order-list.component.html'
    }
)
export class StockOrderListComponent implements OnInit {
    constructor(private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    searchControl = new FormControl();
    searchForm;


    private nbHitsShown: number= 5
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)
    private isPageRunning: boolean = true

    private orders; //: Observable<any>;
    @Input() ordersObservable: Observable<any>;
    @Input() state;    
    @Input() path: string
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();

        Observable.combineLatest(this.ordersObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (orders, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$') return orders;

            return orders.filter(order => {
                return (order.annotation.user && order.annotation.user.toUpperCase().includes(txt)) ||
                    (order.annotation.product && order.annotation.product.toUpperCase().includes(txt)) ||
                    (order.annotation.catalogNr && order.annotation.catalogNr.toUpperCase().includes(txt)) 
            });
        }).do(orders => {
            this.nbHits= orders.length
        })
        .switchMap(orders => {
            return this.nbHitsShownObservable.map(nbItems => {
                return orders.slice(0, nbItems)
            })
        }).takeWhile(() => this.isPageRunning).subscribe(orders => {
            if (!comparatorsUtils.softCopy(this.orders, orders))
            {
                this.orders= comparatorsUtils.clone(orders)
            }
        });

    }

    ngOnDestroy(): void {
         this.isPageRunning = false
    }

    getOrderObservable(id: string): Observable<any> {
        return this.ordersObservable.map(orders => 
        {
            let order= orders.filter(s => s.data._id === id)[0];
            return order; 
        } );
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

    private moreHits() {
        this.nbHitsShown+= this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }
    
}

