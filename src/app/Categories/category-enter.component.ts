import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { Observable, Subscription } from 'rxjs/Rx'

@Component({
        //moduleId: module.id,
        selector: 'gg-category-enter',
        templateUrl: './category-enter.component.html'    
})
export class CategoryEnterComponent implements OnInit {
    private categoryForm: FormGroup;
    
    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }
 
    ngOnInit():void {

        this.categoryForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            noArticle: [''],
            groupMarch: [''],
            isBlocked: [''],
            isLabo: [''],
            isOffice: ['']
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('categories', {
            name: formValue.name,
            noArticle: formValue.noArticle,
            groupMarch: formValue.groupMarch,
            isBlocked: formValue.isBlocked,
            isLabo: formValue.isLabo,
            isOffice: formValue.isOffice
        }).first().subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.categoryForm.reset();    
    }

}

