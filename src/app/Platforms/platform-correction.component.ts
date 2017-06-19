import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-correction',
        templateUrl: './platform-correction.component.html'
    }
)
export class PlatformCorrectionComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore) {
    }

private correctionForm: FormGroup
private correctionList: any
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.correctionForm = this.formBuilder.group({
            correctionType: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            defaultPerCent: ['', [Validators.required]]
        })

        this.dataStore.getDataObservable('platform.correction.types').takeWhile(() => this.isPageRunning).subscribe(correction => {
            if (!comparatorsUtils.softCopy(this.correctionList, correction))
                this.correctionList= comparatorsUtils.clone(correction)            
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.correction.types', {
            name: formValue.correctionType,
            description: formValue.description,
            defaultPerCent: formValue.defaultPerCent
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.correctionForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameCorrectionUpdated(name, correctionItem) {
        correctionItem.name = name
        this.dataStore.updateData('platform.correction.types', correctionItem._id, correctionItem)
    }

    descriptionCorrectionUpdated(description, correctionItem) {
        correctionItem.description = description
        this.dataStore.updateData('platform.correction.types', correctionItem._id, correctionItem)
    }

    defaultPerCentUpdated(defaultPerCent, correctionItem) {
        correctionItem.defaultPerCent = +defaultPerCent
        this.dataStore.updateData('platform.correction.types', correctionItem._id, correctionItem)
    }


}