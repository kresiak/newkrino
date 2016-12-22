import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './category-list.routable.component.html'        
    }
)
export class CategoryListComponentRoutable implements OnInit {
    constructor() { }

    ngOnInit(): void {
    }
}