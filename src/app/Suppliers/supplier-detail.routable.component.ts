import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { SupplierService } from '../Shared/Services/supplier.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './supplier-detail.routable.component.html'        
    }
)
export class SupplierDetailComponentRoutable implements OnInit {
    constructor(private supplierService: SupplierService, private route: ActivatedRoute, private navigationService: NavigationService, private authService: AuthService) { }

    supplier: any
    state: {}    

    private authorizationStatusInfo: AuthenticationStatusInfo

    supplierObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.supplierObservable = this.supplierService.getAnnotatedSupplierById(id);
            this.supplierObservable.subscribe(obj => {
                this.supplier = obj
            })
        }
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });

        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        
    }
    
}
