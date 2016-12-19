import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
//import {ProductService} from '../Shared/Services/product.service'

@Component({
        moduleId: module.id,
        selector: 'gg-otp-enter',
        templateUrl: './otp-enter.component.html'    
})
export class OtpEnterComponent implements OnInit {
    private otpForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }

    private categoryData: SelectableData[];

    private isCategoryIdSelected(control: FormControl){   // custom validator implementing ValidatorFn 
            if (control.value === '-1') {
                return { "category": true };
            }

            return null;
        }

 
    ngOnInit():void
    {
        this.dataStore.getOtpSelectableCategories().subscribe(cd => this.categoryData= cd);

        this.otpForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            budget: ['', Validators.required],
            description: ['', Validators.required],
            datStart: [''],
            datEnd: [''],
            isBlocked: [''],
            isClosed: [''],
            equipeId: ['', Validators.required],
            client: [''],
            note: [''],
            category: ['-1', this.isCategoryIdSelected]
        });
    }

    //private otp;

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
            equipeId: formValue.equipeId,   
            client: formValue.client,
            note: formValue.note,
            categoryIds: [formValue.category] //['583ea9e5495499592417a3b4','583ea9e5495499592417a3b8']
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.otpForm.reset();        
        this.otpForm.controls['category'].setValue('-1');
        
    }
/*
    dateUpdated(date) {
        this.otp.data.datEnd = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

     dateUpdatedStart(date) {
        this.otp.data.datStart = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }
*/
}

