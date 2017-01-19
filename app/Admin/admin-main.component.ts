import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'

@Component(
    {
        moduleId: module.id,
        templateUrl: './admin-main.component.html'
    }
)

export class AdminMainComponent {
    constructor() {

    }

    @Input() state;
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
    }

    public beforeTabChange($event: NgbTabChangeEvent) {        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
        
}