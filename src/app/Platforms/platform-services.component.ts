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


    private isPageRunning: boolean = true

    private state
    private categoryIdObservable
    private categoryId
    private categoryForm: FormGroup
    private categoryList = []

    private servicesObservable: Observable<any>


    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }


    ngOnInit(): void {
        this.stateInit()
        this.serviceForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.servicesObservable= this.platformService.getAnnotatedServices()

        this.categoryForm = this.formBuilder.group({
            nameOfCategory: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.dataStore.getDataObservable('platform.service.categories').takeWhile(() => this.isPageRunning).subscribe(category => {
            if (!comparatorsUtils.softCopy(this.categoryList, category))
                this.categoryList= comparatorsUtils.clone(category)            
        })

        this.categoryIdObservable = this.dataStore.getDataObservable('platform.service.categories').takeWhile(() => this.isPageRunning).map(categories => categories.map(categoryId => {
            return {
                id: categoryId._id,
                name: categoryId.name
            }
        }))

    }

    addService(formValue, isValid) {
        if (!isValid) return
        this.dataStore.addData('platform.services', {
            name: formValue.nameOfService,
            description: formValue.description,
            categoryId: this.categoryId
        }).subscribe(res => {
            this.reset()
        })
    }

    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };

    public beforeTabChange() {        
        this.state.openPanelId= ''
    };


    reset() {
        this.serviceForm.reset()
    }

    saveCategoryForm(formValue, isValid) {
        this.dataStore.addData('platform.service.categories', {
            name: formValue.nameOfCategory,
            description: formValue.description
        }).subscribe(res =>
        {
            this.resetCategoryForm()
        })
    }

    resetCategoryForm()
    {
        this.categoryForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    categoryIdChanged(categoryId) {
        this.categoryId = categoryId
    }

    nameServiceCategoryUpdated(name, categoryItem) {
        categoryItem.name = name
        this.dataStore.updateData('platform.service.categories', categoryItem._id, categoryItem)
    }

    descriptionServiceCategoryUpdated(description, categoryItem) {
        categoryItem.description = description
        this.dataStore.updateData('platform.service.categories', categoryItem._id, categoryItem)
    }

    getServiceObservableByCategory(catId: string) {
        return this.platformService.getAnnotatedServices().map(services => services.filter(service => service.data.categoryId === catId))
    }
    
}