import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-offer-detail',
        templateUrl: './platform-offer-detail.component.html'
    }
)
export class PlatformOfferDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() offerItem
    @Input() isSnapshot: boolean = false    

    private isPageRunning: boolean = true
    private clientsListObservable
    private clientId: string
    private servicesObservable: Observable<any>

    ngOnInit(): void {

        this.clientsListObservable = this.platformService.getAnnotatedClients().takeWhile(() => this.isPageRunning).map(clients => clients.map(client => {
                return {
                    id: client.data._id,
                    name: client.annotation.fullName + ' (' + client.annotation.enterprise + ')'
                }
            }))

        this.servicesObservable = this.platformService.getAnnotatedServices().map(services => services.filter(s => s.annotation.currentSnapshot))
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

    getServicesIdsSelected() {
        return (this.offerItem.data.services || []).map(p => p.id)
    }

    servicesChanged(servicesIds: string[]) {
        if (!this.offerItem.data.services) this.offerItem.data.services = []
        var services = this.offerItem.data.services

        services = services.filter(s => servicesIds.includes(s.id))

        servicesIds.filter(id => !services.map(p => p.id).includes(id)).forEach(id => services.push({ id: id, quantity: 1, reduction: 0 }))

        this.offerItem.data.services = services

        this.dataStore.updateData('platform.offers', this.offerItem.data._id, this.offerItem.data)
    }

    deleteService(pos) {
        this.offerItem.data.services.splice(pos, 1)
        this.dataStore.updateData('platform.offers', this.offerItem.data._id, this.offerItem.data)
    }

    serviceQuantityUpdated(pos, quantity) {
        this.offerItem.data.services[pos].quantity = quantity
        this.dataStore.updateData('platform.offers', this.offerItem.data._id, this.offerItem.data)
    }

    serviceReductionUpdated(pos, reduction) {
        this.offerItem.data.services[pos].reduction = reduction
        this.dataStore.updateData('platform.offers', this.offerItem.data._id, this.offerItem.data)
    }

}