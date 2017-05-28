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
    private selectedIds;
    private otp;

    @Input() equipeId: string;

    @ViewChild('categoriesSelector') categoriesChild;
    @ViewChild('datStart') datStartChild;
    @ViewChild('datEnd') datEndChild;

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();

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

    save(formValue, isValid) {
        if (formValue.isAnnual === '') {
            this.dataStore.addData('otps', {
                name: formValue.name,
                isAnnual: formValue.isAnnual!=='' && formValue.isAnnual!== null,
                budget: formValue.budget,
                budgetBlocked: formValue.budgetBlocked,
                description: formValue.description,
                datStart: this.datStart || moment().format('DD/MM/YYYY HH:mm:ss'),
                datEnd: this.datEnd || moment().format('DD/MM/YYYY HH:mm:ss'),
                isBlocked: formValue.isBlocked!=='' && formValue.isBlocked!== null,
                isClosed: formValue.isClosed!=='' && formValue.isClosed!== null,
                isLimitedToOwner: formValue.isLimitedToOwner!== '' && formValue.isLimitedToOwner!==null,
                equipeId: this.equipeId,
                note: formValue.note,
                categoryIds: this.selectedIds
            }).first().subscribe(res => {
                var x = res;
                this.reset();
            });
        }
        else {
            this.dataStore.addData('otps', {
                name: formValue.name,
                isAnnual: formValue.isAnnual!=='' && formValue.isAnnual!== null,
                budgetBlocked: formValue.budgetBlocked,
                description: formValue.description,
                isBlocked: formValue.isBlocked!=='' && formValue.isBlocked!== null,
                isClosed: formValue.isClosed!=='' && formValue.isClosed!== null,
                isLimitedToOwner: formValue.isLimitedToOwner!== '' && formValue.isLimitedToOwner!==null,
                equipeId: this.equipeId,
                note: formValue.note,
                categoryIds: this.selectedIds
            })
            //this.otp.data.budgetHistory = []
            this.otp.data.budgetHistory.push({
                budget: formValue.budget,
                datStart: this.datStart || moment().format('DD/MM/YYYY HH:mm:ss'),
                datEnd: this.datEnd || moment().format('DD/MM/YYYY HH:mm:ss')
            })
        /*    .first().subscribe(res => {
                    var x = res;
                    this.reset();
          }); */
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data)
        }
    }

    reset() {
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
