import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from '../../Shared/Services/data.service'

@Component(
    {
        selector: 'gg-enter-labo',
        templateUrl: './laboratory-enter.component.html'
    }
)

export class LaboratoryEnterComponent {
    constructor( private dataStore: DataStore, private formBuilder: FormBuilder) {
    }

    private labEnterForm: FormGroup
    private isPageRunning: boolean = true

    ngOnInit(): void {

        this.labEnterForm = this.formBuilder.group({
            laboName: ['', [Validators.required, Validators.minLength(2)]],
            laboShortName: ['', [Validators.required, Validators.minLength(2)]],
            userFirstName: ['', [Validators.required, Validators.minLength(2)]],
            userLastName: ['', [Validators.required, Validators.minLength(2)]],
            userPassword: ['', [Validators.required, Validators.minLength(2)]]
        });

    }

    save(formValue, isValid) {
       this.dataStore.addData('', {
           laboName: formValue.laboName,
           laboShortName: formValue.laboShortName,
           userFirstName: formValue.userFirstName,
           userLastName: formValue.userLastName,
           userPassword: formValue.userPassword
        }).first().subscribe(res => {
            var x = res;
            this.resetLabEnterForm();
        });
    }

    resetLabEnterForm() {
        this.labEnterForm.reset();
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

 
}