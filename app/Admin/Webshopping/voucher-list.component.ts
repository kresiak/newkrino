import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ProductService } from './../../Shared/Services/product.service'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {PageScrollService} from 'ng2-page-scroll/ng2-page-scroll';
import { DOCUMENT } from '@angular/platform-browser'



@Component(
    {
        moduleId: module.id,
        selector: 'gg-voucher-list',
        templateUrl: './voucher-list.component.html'
    }
)
export class VoucherListComponent implements OnInit {
    constructor(private productService: ProductService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    @Input() vouchersObservable: Observable<any>;
    vouchers: any

    @Input() state;
    @Input() initialTabInVoucherDetail: string = '';
    @Input() path: string= 'vouchers'
    @Output() stateChanged = new EventEmitter();


    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;

    ngOnInit(): void {
        this.stateInit();
        //this.vouchersObservable = this.productService.getAnnotatedVouchers();

        Observable.combineLatest(this.vouchersObservable, this.searchControl.valueChanges.startWith(''), (vouchers, searchTxt: string) => {
            if (searchTxt.trim() === '') return vouchers;
            return vouchers.filter(otp => otp.annotation.user.toUpperCase().includes(searchTxt.toUpperCase()) || otp.annotation.supplier.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(vouchers => this.vouchers = vouchers);
        
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
}

