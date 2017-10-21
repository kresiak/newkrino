import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        templateUrl: './welcome-intro.component.html'
    }
)
export class XeniaWelcomeIntroComponent implements OnInit {
    constructor() { }

    ngOnInit(): void {
    }

    private isPageRunning: boolean= true

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

}
