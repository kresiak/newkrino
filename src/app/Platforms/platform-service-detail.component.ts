import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-detail',
        templateUrl: './platform-service-detail.component.html'
    }
)
export class PlatformServiceDetailComponent implements OnInit {
    servicesSimilarObservable: Observable<any>;

    servicesIdenticalObservable: Observable<any>;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() serviceItem
    @Input() serviceToCompareToId: string= undefined

    private isPageRunning: boolean = true

    private state

    private clientListObservable

    private cloneForm: FormGroup    

    private stateInit() {
        if (!this.state) this.state = {};
    }

    private selectableCategoriesObservable: Observable<SelectableData[]>;
    private selectedCategoryIdsObservable: Observable<any>;

    ngOnInit(): void {
        this.stateInit()

        this.selectableCategoriesObservable = this.platformService.getSelectableCategories();
        this.selectedCategoryIdsObservable = Observable.from([this.serviceItem.data.categoryIds || []])
        
        
        this.servicesIdenticalObservable= this.platformService.getAnnotatedServicesIdenticalTo(this.serviceItem.data._id)
        this.servicesSimilarObservable= this.platformService.getAnnotatedServicesSimilarTo(this.serviceItem.data._id)

        this.clientListObservable = this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));
        
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

    cloneService(service, formValue, isValid) {
        if (!isValid) return
        this.platformService.cloneService(service.data._id, formValue.nameOfService, formValue.description).subscribe(res => {
            this.resetCloneForm()
        })
    }

    resetCloneForm() {
        this.cloneForm.reset()
    }

     categorySelectionChanged(selectedIds: string[]) {
        this.serviceItem.data.categoryIds = selectedIds;
        this.dataStore.updateData('platform.services', this.serviceItem.data._id, this.serviceItem.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.platformService.createCategory(newCategory);
    }
   
}