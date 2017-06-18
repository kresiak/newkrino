import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-services',
        templateUrl: './platform-services.component.html'
    }
)
export class PlatformServicesComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore) {
    }

private serviceForm: FormGroup
private servicesList: any
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.serviceForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.dataStore.getDataObservable('platform.services').takeWhile(() => this.isPageRunning).subscribe(services => {
            if (!comparatorsUtils.softCopy(this.servicesList, services))
                this.servicesList= comparatorsUtils.clone(services)            
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.services', {
            name: formValue.nameOfService,
            description: formValue.description
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.serviceForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameServiceUpdated(name, serviceItem) {
        serviceItem.name = name
        this.dataStore.updateData('platform.services', serviceItem._id, serviceItem)
    }

    descriptionServiceUpdated(description, serviceItem) {
        serviceItem.description = description
        this.dataStore.updateData('platform.services', serviceItem._id, serviceItem)
    }   
}