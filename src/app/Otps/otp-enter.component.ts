import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { ProductService } from '../Shared/Services/product.service'
import { Observable, Subscription } from 'rxjs/Rx'
import * as moment from "moment"

@Component({
    //moduleId: module.id,
    selector: 'gg-otp-enter',
    templateUrl: './otp-enter.component.html'
})
export class OtpEnterComponent implements OnInit {
    private otpForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder, private productService: ProductService) {

    }

    private datStart: string
    private datEnd: string
    private selectableCategoriesObservable: Observable<any>;

    @Input() equipeId: string;

    @ViewChild('datStart') datStartChild;
    @ViewChild('datEnd') datEndChild;

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();

        var md = moment()

        this.otpForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(5)]],
            isAnnual: [''],
            budget: ['', Validators.required],
            description: ['', Validators.required],
            isBlocked: [''],
            isClosed: [''],
            isLimitedToOwner: [''],
            note: [''],
            excludeFixCost: ['']
        });
    }

    save(formValue, isValid) {
        var newOtpEnter: any = {
            name: formValue.name,
            isAnnual: formValue.isAnnual !== '' && formValue.isAnnual !== null,
            description: formValue.description,
            isBlocked: formValue.isBlocked !== '' && formValue.isBlocked !== null,
            isClosed: formValue.isClosed !== '' && formValue.isClosed !== null,
            excludeFixCost: formValue.excludeFixCost !== '' && formValue.excludeFixCost !== null,
            isLimitedToOwner: formValue.isLimitedToOwner !== '' && formValue.isLimitedToOwner !== null,
            equipeId: this.equipeId,
            note: formValue.note
        }
        let budgetPeriods = []
        budgetPeriods.push({
            budget: formValue.budget,
            datStart: this.datStart || moment().format('DD/MM/YYYY HH:mm:ss'),
            datEnd: this.datEnd || moment().format('DD/MM/YYYY HH:mm:ss')
        })
        newOtpEnter.budgetPeriods = budgetPeriods
        this.dataStore.addData('otps', newOtpEnter
        ).first().subscribe(res => {
            var x = res;
            this.reset();
        });
    }

    reset() {
        this.otpForm.reset();
        this.datStartChild.emptyContent()
        this.datEndChild.emptyContent()
    }

    dateUpdatedStart(date) {
        this.datStart = date;
    }

    dateUpdatedEnd(date) {
        this.datEnd = date;
    }

}
