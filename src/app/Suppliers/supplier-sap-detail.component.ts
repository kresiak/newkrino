import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-supplier-sap-detail',
        templateUrl: './supplier-sap-detail.component.html'
    }
)
export class SupplierSapDetailComponent implements OnInit {
    constructor(private authService: AuthService) {

    }

    @Input() supplierObservable: Observable<any>;

    ngOnInit(): void {

        this.subscriptionSupplier= this.supplierObservable.subscribe(supplier => {
            this.supplier = supplier;
        });

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionSupplier.unsubscribe()
    }
    

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription     
    private subscriptionSupplier: Subscription    

    private supplier: any;

    public beforeTabChange($event: NgbTabChangeEvent) {
    };


    private childOrdersStateChanged($event) {
    }

}


