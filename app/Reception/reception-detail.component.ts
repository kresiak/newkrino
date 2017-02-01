import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from './../Shared/Services/supplier.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"

@Component(
    {
        moduleId: module.id,
        selector: 'gg-reception-detail',
        templateUrl: './reception-detail.component.html'
    }
)

export class ReceptionDetailComponent implements OnInit {
    private receptionForm: FormGroup;
    private suppliersList: any;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private supplierService: SupplierService, private _sanitizer: DomSanitizer ) {}

    ngOnInit(): void {
        this.receptionForm = this.formBuilder.group({
            supplier: ['', [Validators.required, Validators.minLength(5)]],
            reference: ['', Validators.required],
            position: ['', Validators.required],
            supplierId: ['']
        });

        this.supplierService.getAnnotatedSuppliers().subscribe(suppliers => {
            this.suppliersList = suppliers.map(supplier => {
                return {
                    id: supplier.data._id,
                    value: supplier.data.name
                }
            })
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('orders.reception', {
            supplier: formValue.supplier,
            reference: formValue.reference,
            position: formValue.position,
            supplierId: formValue.supplierId.id
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.receptionForm.reset();        
    }
    
    autocompleListFormatter = (data: any): SafeHtml => {
        let html = `<span>${data.value}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }

}