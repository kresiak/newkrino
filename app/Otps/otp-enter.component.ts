import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { ProductService } from '../Shared/Services/product.service'
import * as moment from "moment"

@Component({
    moduleId: module.id,
    selector: 'gg-otp-enter',
    templateUrl: './otp-enter.component.html'
})
export class OtpEnterComponent implements OnInit {
    private otpForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder, private productService: ProductService) {

    }

    private categoryData: SelectableData[];

    private isCategoryIdSelected(control: FormControl) {   // custom validator implementing ValidatorFn 
        if (control.value === '-1') {
            return { "category": true };
        }

        return null;
    }

    private datStart: string 
    private datEnd: string 


    ngOnInit(): void {
        this.productService.getSelectableCategories().subscribe(cd => this.categoryData = cd);

        var md = moment()

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

    save(formValue, isValid) {
        this.dataStore.addData('otps', {
            name: formValue.name,
            budget: formValue.budget,
            description: formValue.description,
            datStart: this.datStart,
            datEnd: this.datEnd,
            isBlocked: formValue.isBlocked,
            isClosed: formValue.isClosed,
            equipeId: formValue.equipeId,
            client: formValue.client,
            note: formValue.note,
            categoryIds: [formValue.category]
        }).subscribe(res => {
            var x = res;
            this.reset();
        });
    }

    reset() {
        this.otpForm.reset();
        this.otpForm.controls['category'].setValue('-1');

    }

   

    dateUpdatedStart(date) {
        this.datStart = date;
    }

    dateUpdatedEnd(date) {
        this.datEnd = date;
    }

}
