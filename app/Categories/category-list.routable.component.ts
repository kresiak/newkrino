import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { NavigationService } from '../Shared/Services/navigation.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './category-list.routable.component.html'
    }
)
export class CategoryListComponentRoutable implements OnInit {
    constructor(private navigationService: NavigationService) { }

    state: {}

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }


    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
    }
}