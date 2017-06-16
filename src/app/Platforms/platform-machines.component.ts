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

        this.machineSubscrible = this.dataStore.getDataObservable('platform.machines').subscribe(machines => {
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

    nameMachineUpdated(name, machineItem) {
        var a = 3
    }

    descriptionMachineUpdated(description, machineItem) {

    }

    lifetimeMachineUpdated(lifetime, machineItem) {

    }

    maintenancePriceMachineUpdated(maintenancePrice, machineItem) {

    }

    occupancyMachineUpdated(occupancy, machineItem) {

    }

    runtimeMachineUpdated(runtime, machineItem) {

    }

    hoursPerDayMachineUpdated(hoursPerDay, machineItem) {
        
    }
    
   
}