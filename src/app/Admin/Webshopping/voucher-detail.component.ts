import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { OrderService } from '../../Shared/Services/order.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-voucher-detail',
        templateUrl: './voucher-detail.component.html'
    }
)
export class VoucherDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private orderService: OrderService) {
    }
    private pieSpentChart;

    @Input() voucherObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false

    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }

    ngOnInit(): void {
        this.stateInit();
        this.voucherObservable.subscribe(eq => {
            this.voucher = eq;
            if (this.voucher) {
                this.otpListObservable = this.orderService.getAnnotatedOpenOtpsByCategory(this.voucher.data.categoryId).map(otps => otps.map(otp => {
                    return {
                        id: otp.data._id,
                        name: otp.data.name
                    }
                }));
            }
        });
    }

    private voucher: any;
    private otpListObservable: any

    commentsUpdated(comments) {
        if (this.voucher && comments) {
            this.voucher.data.comments = comments;
            this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
        }
    }

    public beforeTabChange($event: NgbTabChangeEvent) {

        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    sapIdUpdated(name) {
        this.voucher.data.sapId = name;
        this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
    }

    otpChanged(newid) {
        this.voucher.data.otpId = newid;
        this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
    }

    isInSapUpdated(flag) {
        if (this.voucher.data.shopping) {
            this.voucher.data.shopping.isSapUpdated = flag
            this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
        }
    }
}