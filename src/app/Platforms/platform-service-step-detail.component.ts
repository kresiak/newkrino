import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { ProductService } from './../Shared/Services/product.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-step-detail',
        templateUrl: './platform-service-step-detail.component.html'
    }
)
export class PlatformServiceStepDetailComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService, private productService: ProductService) {
    }

    @Input() serviceStepId: string = ''

    //private serviceStepForm: FormGroup

    private serviceStep: any

    private isPageRunning: boolean = true

    private productsObservable: Observable<any>;


    private machineListObservable

    ngOnInit(): void {
        /*        this.serviceStepForm = this.formBuilder.group({
                    name: ['', [Validators.required, Validators.minLength(3)]],
                    description: ['']
                })
        */
        this.platformService.getAnnotatedServiceStep(this.serviceStepId).takeWhile(() => this.isPageRunning).subscribe(serviceStep => {
            if (!comparatorsUtils.softCopy(this.serviceStep, serviceStep))
                this.serviceStep = serviceStep
        })

        this.machineListObservable = this.dataStore.getDataObservable('platform.machines').map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));

        this.productsObservable = this.productService.getAnnotatedProductsAll();        

    }

    /*    private machineId: string
    
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
    */
    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameStepUpdated(name: string) {
        this.serviceStep.data.name = name;
        this.dataStore.updateData('platform.service.steps', this.serviceStep.data._id, this.serviceStep.data);
    }

    descriptionStepUpdated(description: string) {
        this.serviceStep.data.description = description;
        this.dataStore.updateData('platform.service.steps', this.serviceStep.data._id, this.serviceStep.data);
    }

    machineChanged(machineId) {
        this.serviceStep.data.machineId = machineId
        this.dataStore.updateData('platform.service.steps', this.serviceStep.data._id, this.serviceStep.data);
    }

    productsChanged(productIds: string[]) {
        if (!this.serviceStep.data.products) this.serviceStep.data.products=[]
        var products= this.serviceStep.data.products
        
        products= products.filter(prod => productIds.includes(prod.id))

        productIds.filter(id => !products.map(p => p.id).includes(id)).forEach(id => products.push({id: id, quantity: 1}))

        this.serviceStep.data.products= products

        this.dataStore.updateData('platform.service.steps', this.serviceStep.data._id, this.serviceStep.data)
    }

    productQuantityUpdated(pos, quantity) {
        this.serviceStep.data.products[pos].quantity= quantity
        this.dataStore.updateData('platform.service.steps', this.serviceStep.data._id, this.serviceStep.data)
    }

    getProductIdsSelected() {
        return (this.serviceStep.data.products || []).map(p => p.id)
    }
}