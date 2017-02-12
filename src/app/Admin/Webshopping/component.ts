import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { ProductService } from './../../Shared/Services/product.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-admin-webshopping',
        templateUrl: './component.html'
    }
)

export class AdminWebShoppingComponent {
    constructor(private productService: ProductService) {

    }

    @Input() state;
    @Output() stateChanged = new EventEmitter()

    vouchersObservable: Observable<any>;
    usedVouchersObservable: Observable<any>;    
    vouchersReadyForSapObservable: Observable<any>;

    private stateInit() {
        if (!this.state) this.state = {}
        if (!this.state.selectedTabId) this.state.selectedTabId = ''
    }

    ngOnInit(): void {
        this.stateInit()
        this.vouchersObservable = this.productService.getAnnotatedVouchersByCreationDate()
        this.usedVouchersObservable= this.productService.getAnnotatedUsedVouchersByDate()
        this.vouchersReadyForSapObservable= this.productService.getAnnotatedUsedVouchersReadyForSap()
    }

    public beforeTabChange($event: NgbTabChangeEvent) {        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
        
}