import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ConfigService } from './../Shared/Services/config.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import * as moment from "moment"
import * as comparatorsUtils from './../Shared/Utils/comparators'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-order-list',
        templateUrl: './order-list.component.html'
    }
)
export class OrderListComponent implements OnInit {
    constructor(private configService: ConfigService, private authService: AuthService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    private isPageRunning: boolean = true

    private listName= 'orderList'
    private showSearch: boolean= false

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

    private authorizationStatusInfo: AuthenticationStatusInfo;

    resetSerachControl() {
    this.searchControl.setValue('')
    };

    private total: number= 0

    ngOnInit(): void {        
        this.stateInit();
        var initialSearch= this.configService.listGetSearchText(this.listName)
        if (initialSearch){ 
            this.showSearch= true
            this.searchControl.setValue(initialSearch)
        }
        this.nbHitsShownObservable.next(this.nbHitsShown= this.configService.listGetNbHits(this.listName, this.nbHitsShown))


        this.orders2Observable = Observable.combineLatest(this.ordersObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch), (orders, searchTxt: string) => {
            this.configService.listSaveSearchText(this.listName, searchTxt)            
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$' || txt === '$>' || txt === '$<' || txt === '#') return orders.filter(order => !order.data.status || order.data.status.value!=='deleted');
            return orders.filter(order => {
                if (txt.startsWith('#AD')) {
                    return order.annotation.allDelivered && order.data.status.value!=='deleted'
                }
                if (txt.startsWith('#ND')) {
                    return !order.annotation.allDelivered && order.data.status.value!=='deleted'
                }
                if (txt.startsWith('#ZD')) {
                    return !order.annotation.allDelivered && !order.annotation.anyDelivered && order.data.status.value!=='deleted'
                }
                if (txt.startsWith('#PD')) {
                    return order.annotation.anyDelivered && !order.annotation.allDelivered && order.data.status.value!=='deleted'
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
                    || (this.authorizationStatusInfo.isProgrammer() &&  order.data._id.toUpperCase().includes(txt))
                    || (order.annotation.equipe && order.annotation.equipe.toUpperCase().includes(txt))
                    || order.annotation.status.toUpperCase().includes(txt)
                    || (order.data.kid || '').toString().includes(txt) || (order.annotation.sapId ||'').toString().includes(txt);

            })
        }).do(orders => {
            this.nbHits= orders.length
            this.total= orders.filter(order =>  !order.annotation.status.toUpperCase().includes('DELETED')).reduce((acc, order) => acc + order.annotation.total, 0)
        })
        .switchMap(orders => {
            return this.nbHitsShownObservable.map(nbItems => {
                return orders.slice(0, nbItems)
            })
        });

        this.orders2Observable.takeWhile(() => this.isPageRunning).subscribe(o => {
            if (!comparatorsUtils.softCopy(this.orders, o))
                this.orders= comparatorsUtils.clone(o)
        })

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
        
    }

    ngOnDestroy(): void {
         this.isPageRunning = false
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
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    
}

