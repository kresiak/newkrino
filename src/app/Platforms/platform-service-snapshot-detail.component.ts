import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-snapshot-detail',
        templateUrl: './platform-service-snapshot-detail.component.html'
    }
)
export class PlatformServiceSnapshotDetailComponent implements OnInit {

    constructor(private dataStore: DataStore, private platformService: PlatformService, private formBuilder: FormBuilder) {
    }

    @Input() snapshot

    private isPageRunning: boolean = true

    private state
    private linkToProductForm: FormGroup

    private clientListObservable

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit()


        this.linkToProductForm = this.formBuilder.group({
            nameOfLink: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        })

        this.clientListObservable = this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).map(clientTypes => clientTypes.map(ct => {
            return {
                id: ct._id,
                name: ct.name
            }
        }));        

    }

    saveLinkToProductForm(formValue, isValid) {
        this.dataStore.addData('', {
            name: formValue.nameOfLink,
            description: formValue.description
        }).subscribe(res => {
            this.resetLinkToProductForm()
        })
    }

    resetLinkToProductForm() {
        this.linkToProductForm.reset()
    }


    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    enableDisableSnapshot(isDisabled: boolean, snapshot) {
        delete snapshot.confirmation
        snapshot.isDisabled = isDisabled
        this.dataStore.updateData('platform.service.snapshots', snapshot._id, snapshot)
    }

}