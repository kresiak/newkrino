import { Component, OnInit, Input, Output } from '@angular/core'
import { SupplierService } from './../Shared/Services/supplier.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable } from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        templateUrl: './supplier-list.routable.component.html'        
    }
)
export class SupplierListComponentRoutable implements OnInit {
    constructor(private supplierService: SupplierService, private navigationService: NavigationService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
    }

    private suppliersObservable: Observable<any>;
}
