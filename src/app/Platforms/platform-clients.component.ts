import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-clients',
        templateUrl: './platform-clients.component.html'
    }
)
export class PlatformClientsComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

private clientsForm: FormGroup
private clientsList: any
private isPageRunning: boolean = true
private entrepriseListObservable
private enterpriseId: string

    ngOnInit(): void {
        this.clientsForm = this.formBuilder.group({
            nameOfClient: ['', [Validators.required, Validators.minLength(3)]],
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', Validators.required],
            telephone: ['', Validators.required]
        })

        this.platformService.getAnnotatedClients().takeWhile(() => this.isPageRunning).subscribe(clients => {
            if (!comparatorsUtils.softCopy(this.clientsList, clients))
                this.clientsList= comparatorsUtils.clone(clients)            
        })
        
        this.entrepriseListObservable = this.dataStore.getDataObservable('platform.enterprises').takeWhile(() => this.isPageRunning).map(enterprises => enterprises.map(enterprise => {
                return {
                    id: enterprise._id,
                    name: enterprise.name
                }
            }))

    }

    enterpriseChanged(enterpriseId) {
        this.enterpriseId = enterpriseId
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.clients', {
            name: formValue.nameOfClient,
            firstName: formValue.firstName,
            email: formValue.email,
            telephone: formValue.telephone,
            enterpriseId: this.enterpriseId
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.clientsForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameClientUpdated(name, clientItem) {
        clientItem.data.name = name
        this.dataStore.updateData('platform.clients', clientItem.data._id, clientItem.data)
    }

    firstNameClientUpdated(firstName, clientItem) {
        clientItem.data.firstName = firstName
        this.dataStore.updateData('platform.clients', clientItem.data._id, clientItem.data)
    }

    emailClientUpdated(email, clientItem) {
        clientItem.data.email = email
        this.dataStore.updateData('platform.clients', clientItem.data._id, clientItem.data)
    }

    telephoneClientUpdated(telephone, clientItem) {
        clientItem.data.telephone = telephone
        this.dataStore.updateData('platform.clients', clientItem.data._id, clientItem.data)
    }

    enterpriseUpdated(enterpriseId, clientItem) {
        clientItem.data.enterpriseId = enterpriseId
        this.dataStore.updateData('platform.clients', clientItem.data._id, clientItem.data)
    }

   
}