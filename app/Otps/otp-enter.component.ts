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
    private otpForm56: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }

    ngOnInit():void
    {

        this.otpForm56= this.formBuilder.group({
            //description89: ['', [Validators.required, Validators.minLength(5)]],
          
            name: ['', Validators.required],
            budget: ['', Validators.required],
            description: ['', Validators.required],
            datStart: [''],
            datEnd: [''],
            isBlocked: [''],
            isClosed: [''],
            equipedId: ['', Validators.required],
            client: ['', Validators.required],
            note: ['']
        });
    }


    save145(formValue, isValid)
    {
        this.dataStore.addData('otps', {
            //name: formValue.description89,

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
        this.otpForm56.reset();        
        this.otpForm56.controls['category'].setValue('-1'); // CHANGER category > otp?
    }
}
