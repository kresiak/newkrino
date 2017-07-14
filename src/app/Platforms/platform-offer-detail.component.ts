import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offer-detail',
        templateUrl: './platform-offer-detail.component.html'
    }
)
export class PlatformOfferDetailComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }
    
@Input() offerItem
private offersList: any
private isPageRunning: boolean = true
private clientsListObservable
private clientId: string

    ngOnInit(): void {

        this.platformService.getAnnotatedOffers().takeWhile(() => this.isPageRunning).subscribe(offers => {
            if (!comparatorsUtils.softCopy(this.offersList, offers))
                this.offersList= comparatorsUtils.clone(offers)            
        })
        
        this.clientsListObservable = this.dataStore.getDataObservable('platform.clients').takeWhile(() => this.isPageRunning).map(clients => clients.map(client => {
                return {
                    id: client._id,
                    name: client.name
                }
            }))
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    descriptionUpdated(description, offerItem) {
        offerItem.data.description = description
        this.dataStore.updateData('platform.offers', offerItem.data._id, offerItem.data)
    }
   
    clientIdUpdated(clientId, offerItem) {
        offerItem.data.clientId = clientId
        this.dataStore.updateData('platform.offers', offerItem.data._id, offerItem.data)
    }

}