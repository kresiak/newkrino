import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-step-list',
        templateUrl: './platform-service-step-list.component.html'
    }
)
export class PlatformServiceStepListComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() serviceId: string= ''

    private serviceStepForm: FormGroup
    private serviceStepsList: any
    private isPageRunning: boolean = true

    ngOnInit(): void {
        this.serviceStepForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.platformService.getAnnotatedServiceSteps(this.serviceId).takeWhile(() => this.isPageRunning).subscribe(serviceSteps => {
            if (!comparatorsUtils.softCopy(this.serviceStepsList, serviceSteps))
                this.serviceStepsList = comparatorsUtils.clone(serviceSteps)
        })
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.service.steps', {
            name: formValue.name,
            description: formValue.description,
            serviceId: this.serviceId
        }).subscribe(res => {
            this.reset()
        })
    }

    reset() {
        this.serviceStepForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}