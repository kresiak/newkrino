import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offers',
        templateUrl: './platform-offers.component.html'
    }
)
export class PlatformOffersComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

private offerForm: FormGroup
private offersList: any
private isPageRunning: boolean = true
private clientsListObservable
private clientId: string

    ngOnInit(): void {
        this.offerForm = this.formBuilder.group({
            description: ['', [Validators.required, Validators.minLength(3)]]
        })

        this.platformService.getAnnotatedOffers().takeWhile(() => this.isPageRunning).subscribe(offers => {
            if (!comparatorsUtils.softCopy(this.offersList, offers))
                this.offersList= comparatorsUtils.clone(offers)            
        })
        
        this.clientsListObservable = this.platformService.getAnnotatedClients().takeWhile(() => this.isPageRunning).map(clients => clients.map(client => {
                return {
                    id: client.data._id,
                    name: client.annotation.fullName + ' (' + client.annotation.enterprise + ')'
                }
            }))
                   
    }

    clientIdChanged(clientId) {
        this.clientId = clientId
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.offers', {
            description: formValue.description,
            clientId: this.clientId
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.offerForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}