import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './equipe-list.routable.component.html'        
    }
)
export class EquipeListComponentRoutable implements OnInit {
    
    path: string= 'equipes'

    constructor() { 

    }

    ngOnInit(): void {
    }
}