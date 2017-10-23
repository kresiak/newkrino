import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'

import { XeniaWelcomeService } from '../services/welcome.service'

@Component(
    {
        templateUrl: './welcome-name.component.html'
    }
)
export class XeniaWelcomeNameComponent implements OnInit {
    constructor(private welcomeService: XeniaWelcomeService) { }

    ngOnInit(): void {
    }

    private isPageRunning: boolean= true

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

}
