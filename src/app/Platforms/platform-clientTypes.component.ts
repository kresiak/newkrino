import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-client',
        templateUrl: './platform-clientTypes.component.html'
    }
)
export class PlatformClientComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

    private clientForm: FormGroup
    private clientList: any
    private correctionList: any
    private isPageRunning: boolean = true

    private fnGetCorrectionsForClient = (id) => []

    ngOnInit(): void {
        this.clientForm = this.formBuilder.group({
            clientType: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).subscribe(client => {
            if (!comparatorsUtils.softCopy(this.clientList, client))
                this.clientList = comparatorsUtils.clone(client)
        })

        this.dataStore.getDataObservable('platform.correction.types').takeWhile(() => this.isPageRunning).subscribe(corrections => {
            if (!comparatorsUtils.softCopy(this.correctionList, corrections))
                this.correctionList = comparatorsUtils.clone(corrections)
        })

        Observable.combineLatest(this.dataStore.getDataObservable('platform.client.types'), this.dataStore.getDataObservable('platform.correction.types'),
            (clients, corrections) => {
                return {
                    clients: clients,
                    corrections: corrections
                }
            }).do((obj) => {
                var clients = obj.clients
                var corrections = obj.corrections
                if (!comparatorsUtils.softCopy(this.clientList, clients))
                    this.clientList = comparatorsUtils.clone(clients)
                if (!comparatorsUtils.softCopy(this.correctionList, corrections))
                    this.correctionList = comparatorsUtils.clone(corrections)
                this.fnGetCorrectionsForClient = (clientId) => this.platformService.getCorrectionsOfClientType(clientId, clients, corrections)
            }).takeWhile(() => this.isPageRunning).subscribe(res => {

            })
    }


    save(formValue, isValid) {
        this.dataStore.addData('platform.client.types', {
            name: formValue.clientType,
            description: formValue.description
        }).subscribe(res => {
            this.reset()
        })
    }

    reset() {
        this.clientForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameClientUpdated(name, clientItem) {
        clientItem.name = name
        this.dataStore.updateData('platform.client.types', clientItem._id, clientItem)
    }

    descriptionClientUpdated(description, clientItem) {
        clientItem.description = description
        this.dataStore.updateData('platform.client.types', clientItem._id, clientItem)
    }

    correctionGetValue(correctionId, clientId) {
        var client = this.clientList.filter(c => c._id === clientId)[0]
        if (!client) return -1
        if (client.corrections && client.corrections.map(c => c.id).includes(correctionId)) {
            return client.corrections.filter(c => c.id === correctionId)[0].perCent
        }
        var corr = this.correctionList.filter(c => c._id === correctionId)[0]
        if (!corr) return -2
        return corr.defaultPerCent
    }

    isCorrectionDefaultValue(correctionId, clientId) {
        var client = this.clientList.filter(c => c._id === clientId)[0]
        if (!client) return true
        if (client.corrections && client.corrections.map(c => c.id).includes(correctionId)) {
            return false
        }
        return true
    }

    correctionSaveValue(newValue, correctionId, clientId) {
        if (! +newValue && (+newValue !== 0) ) return

        var client = this.clientList.filter(c => c._id === clientId)[0]
        if (!client) return

        if (!client.corrections) client.corrections = []

        if (client.corrections.map(c => c.id).includes(correctionId)) {
            var corrEntry = client.corrections.filter(c => c.id === correctionId)[0]
            if (+newValue >= 0) corrEntry.perCent = +newValue
            else {
                var pos = client.corrections.indexOf(corrEntry)
                if (pos >= 0) client.corrections.splice(pos, 1)
            }
        }
        else if (+newValue >= 0) {
            client.corrections.push({ id: correctionId, perCent: +newValue })
        }
        else {
            return
        }

        this.dataStore.updateData('platform.client.types', client._id, client)
    }
}