import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { ProductService } from '../../Shared/Services/product.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-voucher-request-list',
        templateUrl: './voucher-request-list.component.html'
    }
)

export class AdminWebShoppingVoucherRequestListComponent {
    constructor(private productService: ProductService) {

    }

    @Input() state;
    @Output() stateChanged = new EventEmitter()
    openPanelId: string = ""
    

    private stateInit() {
        if (!this.state) this.state = {}
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit()
        this.openRequestsObservable = this.productService.getOpenRequestedVouchers()
    }

    private openRequestsObservable: Observable<any>

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState)
        {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }            
    };

}