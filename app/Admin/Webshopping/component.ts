import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-admin-webshopping',
        templateUrl: './component.html'
    }
)

export class AdminWebShoppingComponent {
    constructor() {

    }

    @Input() state;
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {}
        if (!this.state.selectedTabId) this.state.selectedTabId = ''
    }

    ngOnInit(): void {
        this.stateInit()
    }

    public beforeTabChange($event: NgbTabChangeEvent) {        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
        
}