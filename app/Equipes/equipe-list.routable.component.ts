import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './equipe-list.routable.component.html'        
    }
)
export class EquipeListComponentRoutable implements OnInit {
    
    constructor(private navigationService: NavigationService) { 

    }

    state: {}


    ngOnInit(): void {
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        
    }
}