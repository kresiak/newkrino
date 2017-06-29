import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-detail',
        templateUrl: './platform-service-detail.component.html'
    }
)
export class PlatformServiceDetailComponent implements OnInit {

    servicesIdenticalObservable: Observable<any>;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() serviceItem
    @Input() serviceToCompareToId: string= undefined

    private isPageRunning: boolean = true

    private state

    private clientListObservable
    private categoryIdObservable

    private cloneForm: FormGroup    

    private stateInit() {
        if (!this.state) this.state = {};
    }

    ngOnInit(): void {
        this.stateInit()
        
        this.servicesIdenticalObservable= this.platformService.getAnnotatedServicesIdenticalTo(this.serviceItem.data._id)

        this.clientListObservable = this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));
        
        this.categoryIdObservable = this.dataStore.getDataObservable('platform.service.categories').takeWhile(() => this.isPageRunning).map(categories => categories.map(categoryId => {
            return {
                id: categoryId._id,
                name: categoryId.name
            }
        }))   

        this.cloneForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })            
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

    categoryIdInInfoChanged(catId, serviceItem) {
        serviceItem.data.categoryId = catId
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
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
}