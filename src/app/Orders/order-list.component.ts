import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"





@Component(
    {
        //moduleId: module.id,
        selector: 'gg-order-list',
        templateUrl: './order-list.component.html'
    }
)
export class OrderListComponent implements OnInit {
    constructor() {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    searchControl = new FormControl();
    searchForm;

    private orders

    private nbHitsShown: number= 10
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)
    

    @Input() ordersObservable: Observable<any>;
    @Input() state;
    @Input() path: string= 'orders'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    @Input() config;

    private orders2Observable: Observable<any>;
    private ordersSubscription: Subscription

    resetSerachControl() {
    this.searchControl.setValue('')
    };

    ngOnInit(): void {
        this.stateInit();
        this.orders2Observable = Observable.combineLatest(this.ordersObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (orders, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$' || txt === '$>' || txt === '$<' || txt === '#') return orders.filter(order => !order.data.status || order.data.status.value!=='deleted');
            return orders.filter(order => {
                if (txt.startsWith('#AD')) {
                    return order.annotation.allDelivered
                }
                if (txt.startsWith('#ND')) {
                    return !order.annotation.allDelivered
                }
                if (txt.startsWith('#ZD')) {
                    return !order.annotation.allDelivered && !order.annotation.anyDelivered
                }
                if (txt.startsWith('#PD')) {
                    return order.annotation.anyDelivered && !order.annotation.allDelivered
                }
                if (txt.startsWith('#')) {
                    let txt2 = txt.slice(1);
                    return order.annotation.items.filter(item =>
                        item.annotation.description.toUpperCase().includes(txt2)).length > 0;
                }
                if (txt.startsWith('$>') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + order.annotation.total >= montant;
                }
                if (txt.startsWith('$<') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + order.annotation.total <= montant;
                }
                return order.annotation.user.toUpperCase().includes(txt)
                    || order.annotation.supplier.toUpperCase().includes(txt)
                    || order.data._id.toUpperCase().includes(txt)
                    || (order.annotation.equipe && order.annotation.equipe.toUpperCase().includes(txt))
                    || order.annotation.status.toUpperCase().includes(txt)
                    || order.data.kid === +txt || order.annotation.sapId === +txt;

            })
        }).do(orders => {
            this.nbHits= orders.length
        })
        .switchMap(orders => {
            return this.nbHitsShownObservable.map(nbItems => {
                return orders.slice(0, nbItems)
            })
        });

        this.ordersSubscription=this.orders2Observable.subscribe(o => this.orders=o)
    }

    ngOnDestroy(): void {
         this.ordersSubscription.unsubscribe()
    }


    getOrderObservable(id: string): Observable<any> {
        return this.ordersObservable.map(orders => orders.filter(s => s.data._id === id)[0]);
    }

    formatDate(date: string): string {
        var now = moment()
        var then = moment(date, 'DD/MM/YYYY HH:mm:ss')
        var diff = now.diff(then, 'days');

        //var md= moment(date, 'DD/MM/YYYY HH:mm:ss').fromNow()
        return diff < 15 ? then.fromNow() : then.format('LLLL')
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

    private moreHits() {
        this.nbHitsShown+= this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    
}

