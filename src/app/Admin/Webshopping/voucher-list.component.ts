import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/platform-browser'



@Component(
    {
        //moduleId: module.id,
        selector: 'gg-voucher-list',
        templateUrl: './voucher-list.component.html'
    }
)
export class VoucherListComponent implements OnInit {
    constructor() {
    }

    @Input() vouchersObservable: Observable<any>;

    vouchers: any

    @Input() state;
    @Input() focusOnVoucherUsage: boolean
    @Input() initialTabInVoucherDetail: string = '';
    @Input() path: string= 'vouchers'
    @Output() stateChanged = new EventEmitter();

    fnFilterVoucher(voucher, txt) {
        if(txt ==='') return true
        return voucher.annotation.user.toUpperCase().includes(txt.toUpperCase()) || voucher.annotation.supplier.toUpperCase().includes(txt.toUpperCase())
    }

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit();
    }

    ngOnDestroy(): void {
    }    

    getVoucherObservable(id: string): Observable<any> {
        return this.vouchersObservable.map(vouchers => vouchers.filter(s => s.data._id === id)[0]);
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

    private getVoucherUsageText() {
        return this.focusOnVoucherUsage ? 'ADMINISTRATION.WEB SHOPPING.COLUMN.USED' : 'ADMINISTRATION.WEB SHOPPING.COLUMN.CREATED'
    }


}

