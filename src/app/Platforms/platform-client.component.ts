import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-client',
        templateUrl: './platform-client.component.html'
    }
)
export class PlatformClientComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore) {
    }

private clientForm: FormGroup
private clientList: any
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.clientForm = this.formBuilder.group({
            clientType: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).subscribe(client => {
            if (!comparatorsUtils.softCopy(this.clientList, client))
                this.clientList= comparatorsUtils.clone(client)            
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.client.types', {
            name: formValue.clientType,
            description: formValue.description
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.clientForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameClientUpdated(name, clientItem) {
        clientItem.name = name
        this.dataStore.updateData('platform.client.types', clientItem._id, clientItem)
    }

    descriptionClientUpdated(description, clientItem) {
        clientItem.description = description
        this.dataStore.updateData('platform.client.types', clientItem._id, clientItem)
    }
}