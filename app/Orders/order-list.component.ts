import { Component, OnInit, Input } from '@angular/core'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'

@Component(
    {
        template: `<gg-order-list [ordersObservable]= "ordersObservable"></gg-order-list>`
    }
)
export class OrderListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.ordersObservable = this.orderService.getAnnotedOrders();
    }

    private ordersObservable: Observable<any>;
}



@Component(
    {
        moduleId: module.id,
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


    @Input() ordersObservable: Observable<any>;
    @Input() config;

    private orders2Observable: Observable<any>; 

    ngOnInit(): void {
        this.orders2Observable= Observable.combineLatest(this.ordersObservable, this.searchControl.valueChanges.startWith(''), (orders, searchTxt: string) => {
            let txt: string= searchTxt.trim().toUpperCase(); 
            if (txt === '' || txt === '$' || txt === '$>' || txt === '$<' || txt === '#') return orders;
            return orders.filter(order => {
                if (txt.startsWith('#'))
                {
                    let txt2= txt.slice(1);
                    return order.annotation.items.filter(item => 
                        item.annotation.description.toUpperCase().includes(txt2)).length > 0;
                }
                if (txt.startsWith('$>') &&  +txt.slice(2) )
                {
                    let montant= +txt.slice(2);
                    return + order.annotation.total >= montant;
                }
                if (txt.startsWith('$<') &&  +txt.slice(2) )
                {
                    let montant= +txt.slice(2);
                    return + order.annotation.total <= montant;
                }
                return order.annotation.user.toUpperCase().includes(txt) 
                                    || order.annotation.supplier.toUpperCase().includes(txt)
                                    || order.annotation.equipe.toUpperCase().includes(txt)  ;                                    

            } );
        });
    }

    getOrderObservable(id: string): Observable<any> {
        return this.ordersObservable.map(orders => orders.filter(s => s.data._id === id)[0]);
    }

    formatDate(date: string): string {
        return (new Date(date)).toLocaleDateString()
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }
}

