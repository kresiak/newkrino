import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-compare',
        templateUrl: './platform-service-compare.component.html'
    }
)
export class PlatformServiceCompareComponent implements OnInit {
    service1: any;
    service2: any;
    service1Steps: any;
    service2Steps: any;

    constructor(private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() service1Id: string
    @Input() service2Id: string

    private isPageRunning: boolean = true

    ngOnInit(): void {
        this.platformService.getAnnotatedServices().map(services => services.filter(s => s.data._id === this.service1Id)[0]).takeWhile(() => this.isPageRunning).subscribe(service => {
            this.service1= service
        })
        this.platformService.getAnnotatedServices().map(services => services.filter(s => s.data._id === this.service2Id)[0]).takeWhile(() => this.isPageRunning).subscribe(service => {
            this.service2= service
        })
        this.platformService.getAnnotatedServiceStepsByService(this.service1Id).takeWhile(() => this.isPageRunning).subscribe(steps => {
            this.service1Steps= steps
        })
        this.platformService.getAnnotatedServiceStepsByService(this.service2Id).takeWhile(() => this.isPageRunning).subscribe(steps => {
            this.service2Steps= steps
        })
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    getIndexes(arr) {
        return Array.from(arr.keys())
    }
}