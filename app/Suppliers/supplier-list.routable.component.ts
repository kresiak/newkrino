import { Component, OnInit, Input, Output } from '@angular/core'
import { SupplierService } from './../Shared/Services/supplier.service'
import { Observable } from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        templateUrl: './supplier-list.routable.component.html'        
    }
)
export class SupplierListComponentRoutable implements OnInit {
    constructor(private supplierService: SupplierService) { }

    ngOnInit(): void {
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
    }

    private suppliersObservable: Observable<any>;
}
