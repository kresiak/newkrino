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

    private machineListObservable

    ngOnInit(): void {
        this.serviceStepForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.platformService.getAnnotatedServiceStepsByService(this.serviceId).takeWhile(() => this.isPageRunning).subscribe(serviceSteps => {
            if (!comparatorsUtils.softCopy(this.serviceStepsList, serviceSteps))
                this.serviceStepsList = comparatorsUtils.clone(serviceSteps)
        })

        this.machineListObservable = this.dataStore.getDataObservable('platform.machines').map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));
        
    }

    private machineId: string

    machineChanged(machineId) {
        this.machineId= machineId
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.service.steps', {
            name: formValue.name,
            description: formValue.description,
            serviceId: this.serviceId,
            machineId: this.machineId
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