import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-categories',
        templateUrl: './platform-service-categories.component.html'
    }
)
export class PlatformServiceCategoriesComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore) {
    }

private categoryForm: FormGroup
private categoryList = []
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.categoryForm = this.formBuilder.group({
            nameOfCategory: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.dataStore.getDataObservable('platform.service.categories').takeWhile(() => this.isPageRunning).subscribe(category => {
            if (!comparatorsUtils.softCopy(this.categoryList, category))
                this.categoryList= comparatorsUtils.clone(category)            
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.service.categories', {
            name: formValue.nameOfCategory,
            description: formValue.description
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.categoryForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameServiceCategoryUpdated(name, categoryItem) {
        categoryItem.name = name
        this.dataStore.updateData('platform.service.categories', categoryItem._id, categoryItem)
    }

    descriptionServiceCategoryUpdated(description, categoryItem) {
        categoryItem.description = description
        this.dataStore.updateData('platform.service.categories', categoryItem._id, categoryItem)
    }

}