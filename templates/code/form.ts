import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import * as moment from "moment"

@Component({
    //moduleId: module.id,
    selector: 'gg-otp-enter',
    templateUrl: './otp-enter.component.html'
})
export class OtpEnterComponent implements OnInit {
    private otpForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {

    }

    private datStart: string
    private datEnd: string
    private selectableCategoriesObservable: Observable<any>;
    private selectedIds;

    @Input() equipeId: string;

    @ViewChild('categoriesSelector') categoriesChild;
    @ViewChild('datStart') datStartChild;
    @ViewChild('datEnd') datEndChild;

    ngOnInit(): void {

        var md = moment()

        this.otpForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(5)]],
            isAnnual: [''],
            budget: ['', Validators.required],
            budgetBlocked: ['', Validators.required],
            description: ['', Validators.required],
            isBlocked: [''],
            isClosed: [''],
            isLimitedToOwner: [''],
            note: ['']
        });
    }

    saveForm(formValue, isValid) {
        // do something with the formValues and the values saved in the properties....

        // for example: prepare an object that will be saved into database
        var x= {         
            name: formValue.name,
            isAnnual: formValue.isAnnual !== '' && formValue.isAnnual !== null,
            budget: formValue.budget,
            budgetBlocked: formValue.budgetBlocked,
            description: formValue.description,
            datStart: this.datStart || moment().format('DD/MM/YYYY HH:mm:ss'),
            datEnd: this.datEnd || moment().format('DD/MM/YYYY HH:mm:ss'),
            isBlocked: formValue.isBlocked !== '' && formValue.isBlocked !== null,
            isClosed: formValue.isClosed !== '' && formValue.isClosed !== null,
            isLimitedToOwner: formValue.isLimitedToOwner !== '' && formValue.isLimitedToOwner !== null,
            equipeId: this.equipeId,
            note: formValue.note,
            categoryIds: this.selectedIds
        }
        
    }

    resetForm() {
        this.otpForm.reset();
        this.categoriesChild.emptyContent()
        this.datStartChild.emptyContent()
        this.datEndChild.emptyContent()
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.selectedIds = selectedIds;
    }

    dateUpdatedStart(date) {
        this.datStart = date;
    }

    dateUpdatedEnd(date) {
        this.datEnd = date;
    }

}
