import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'

import { XeniaWelcomeService } from '../services/welcome.service'
import { DataStore } from '../../Shared/Services/data.service'


@Component(
    {
        templateUrl: './welcome-pi.component.html'
    }
)
export class XeniaWelcomePiComponent implements OnInit {
    piId: any;
    pis: any[];
    constructor(private welcomeService: XeniaWelcomeService, private dataStore: DataStore) { }

    ngOnInit(): void {
        var data = this.welcomeService.getData()
        if (data.piId) this.piId= data.piId
        this.checkData()

        this.dataStore.getDataObservable('xenia.pis').takeWhile(() => this.isPageRunning).subscribe(res => {
            this.pis = res.map(p => {
                return {
                    data: p,
                    annotation: {
                        fullName: p.firstName + ' ' + p.name
                    }
                }
            })
        })
    }

    private isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    private checkData() {
        if (this.piId) {
            this.welcomeService.nextEnable(() => {
                this.welcomeService.setPiId(this.piId)
                this.welcomeService.navigateTo('final')
            })
        }
        else {
            this.welcomeService.nextDisable()
        }
    }


    setPiSelected(pi) {
        this.piId = pi.data._id
        this.checkData()
    }
}
