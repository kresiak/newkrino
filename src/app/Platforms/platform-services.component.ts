import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-services',
        templateUrl: './platform-services.component.html'
    }
)
export class PlatformServicesComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

    private serviceForm: FormGroup
    private cloneForm: FormGroup

    private servicesList: any
    private isPageRunning: boolean = true

    private state
    private clientListObservable

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private fnGetCostByService = (id) => 0 // this is a function

    ngOnInit(): void {
        this.stateInit()
        this.serviceForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })
        this.cloneForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })
        this.platformService.getAnnotatedServices().takeWhile(() => this.isPageRunning).subscribe(services => {
            if (!comparatorsUtils.softCopy(this.servicesList, services))
                this.servicesList = comparatorsUtils.clone(services)
            this.state.selectedTabId = 'tabListOfServices'
        })

        this.platformService.getServicesCostInfo().takeWhile(() => this.isPageRunning).subscribe(serviceCostMap => {
            this.fnGetCostByService = (serviceId) => serviceCostMap.has(serviceId) ? serviceCostMap.get(serviceId) : 0
        })

        this.clientListObservable = this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));

    }

    addService(formValue, isValid) {
        if (!isValid) return
        this.dataStore.addData('platform.services', {
            name: formValue.nameOfService,
            description: formValue.description
        }).subscribe(res => {
            this.reset()
        })
    }

    cloneService(service, formValue, isValid) {
        if (!isValid) return
        this.platformService.cloneService(service.data._id, formValue.nameOfService, formValue.description).subscribe(res => {
            this.resetCloneForm()
        })
    }

    resetCloneForm() {
        this.cloneForm.reset()
    }

    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };


    reset() {
        this.serviceForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameServiceUpdated(name, serviceItem) {
        serviceItem.data.name = name
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
    }

    descriptionServiceUpdated(description, serviceItem) {
        serviceItem.data.description = description
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
    }

    clientTypeChanged(typeid, serviceItem) {
        serviceItem.data.clientTypeId = typeid
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)        
    }
}