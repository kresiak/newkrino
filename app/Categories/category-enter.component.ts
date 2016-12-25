import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { Observable } from 'rxjs/Rx'

@Component({
        moduleId: module.id,
        selector: 'gg-category-enter',
        templateUrl: './category-enter.component.html'    
})
export class CategoryEnterComponent implements OnInit {
    private categoryForm: FormGroup;
    
    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }
 
    private isLabo;
    private isOffice;

    //@ViewChild('labSpecifBoolean') isLaboChild;

    ngOnInit():void {

        this.categoryForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            isBlocked: [''],
            noArticle: [''],
            groupMarch: ['']
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('categories', {
            name: formValue.name,
            isLabo: this.isLabo,
            isOffice: this.isOffice,
            isBlocked: formValue.isBlocked,
            noArticle: formValue.noArticle,
            groupMarch: formValue.groupMarch
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.categoryForm.reset();    
        //this.isLaboChild.emptyContent()    
    }

    isLabUpdated(isLabs) {
        this.isLabo = isLabs;
    }

    isOfficeUpdated(isOffices) {
        this.isOffice = isOffices;
    }

}

