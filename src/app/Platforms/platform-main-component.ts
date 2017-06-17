import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'

@Component(
    {
        selector: 'gg-platform-main',
        templateUrl: './platform-main-component.html'
    }
)
export class PlatformMainComponent implements OnInit {
    constructor() {
    }
    ngOnInit(): void {
    }

}