import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-reception-detail',
        templateUrl: './reception-detail.component.html'
    }
)

export class ReceptionDetailComponent implements OnInit {
    private receptionForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore ) {}

    ngOnInit(): void {
        this.receptionForm = this.formBuilder.group({
            supplier: ['', [Validators.required, Validators.minLength(5)]],
            reference: ['', Validators.required],
            position: ['', Validators.required]
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('orders.reception', {
            supplier: formValue.supplier,
            reference: formValue.reference,
            position: formValue.position
        })
        /*.subscribe(res =>
        {
            var x=res;
            this.reset();
        });*/
    }

    reset()
    {
        this.receptionForm.reset();        
    }
    

}
