import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component(
    {
        selector: 'gg-platform-machines',
        templateUrl: './platform-machines.component.html'
    }
)
export class PlatformMachinesComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore) {
    }

private machineForm: FormGroup
private machineSubscrible: Subscription
private machinesList: any
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.machineForm = this.formBuilder.group({
            nameOfMachine: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            lifetime: ['', Validators.required],
            maintenancePrice: ['', Validators.required],
            occupancy: ['', Validators.required],
            runtime: ['', Validators.required],
            hoursPerDay: ['', Validators.required]
        })

        this.machineSubscrible = this.dataStore.getDataObservable('platform.machines').takeWhile(() => this.isPageRunning).subscribe(machines => {
            this.machinesList = machines
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.machines', {
            name: formValue.nameOfMachine,
            description: formValue.description,
            lifetime: formValue.lifetime,
            maintenancePrice: formValue.maintenancePrice,
            occupancy: formValue.occupancy,
            runtime: formValue.runtime,
            hoursPerDay: formValue.hoursPerDay
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.machineForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameMachineUpdated(name, machineItem) {
        machineItem.name = name
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    descriptionMachineUpdated(description, machineItem) {
        machineItem.description = description
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    lifetimeMachineUpdated(lifetime, machineItem) {
        machineItem.lifetime = +lifetime
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    maintenancePriceMachineUpdated(maintenancePrice, machineItem) {
        machineItem.maintenancePrice = +maintenancePrice
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    occupancyMachineUpdated(occupancy, machineItem) {
        machineItem.occupancy = +occupancy
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    runtimeMachineUpdated(runtime, machineItem) {
        machineItem.runtime = +runtime
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }

    hoursPerDayMachineUpdated(hoursPerDay, machineItem) {
        machineItem.hoursPerDay = +hoursPerDay
        this.dataStore.updateData('platform.machines', machineItem._id, machineItem)
    }
    
   
}