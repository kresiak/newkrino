import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        templateUrl: './xenia-welcome-main.component.html'
    }
)
export class XeniaWelcomeMainComponent implements OnInit {
    constructor() { }

    ngOnInit(): void {
    }

    private isPageRunning: boolean= true

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

}
