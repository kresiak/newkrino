import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'

@Component({
        moduleId: module.id,
        selector: 'gg-otp-enter',
        templateUrl: './otp-enter.component.html'    
})
export class OtpEnterComponent implements OnInit {
    private otpForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }

    ngOnInit():void
    {

        this.otpForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            budget: ['', Validators.required],
            description: ['', Validators.required],
            datStart: [''],
            datEnd: [''],
            isBlocked: [''],
            isClosed: [''],
            equipedId: ['', Validators.required],
            client: [''],
            note: ['']
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('otps', {
            name: formValue.name,
            budget: formValue.budget,
            description: formValue.description,
            datStart: formValue.datStart,
            datEnd: formValue.datEnd,
            isBlocked: formValue.isBlocked,
            isClosed: formValue.isClosed,
            equipedId: formValue.equipeId,
            client: formValue.client,
            note: formValue.note
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.otpForm.reset();        
        this.otpForm.controls['otps'].setValue('-1');
    }
}
