import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { PrestationService } from './../Shared/Services/prestation.service'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        moduleId: module.id,
        templateUrl: './prestation-list.html'
    }
)
export class PrestationListComponent implements OnInit {
    constructor(private prestationService: PrestationService) { }

    prestations: Observable<any>;
    
    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit();
        this.prestations = this.prestationService.getAnnotatedPrestations();
    }

    getPrestationObservable(id: string): Observable<any> {
        return this.prestations.map(prestations => prestations.filter(s => s.data._id === id)[0]);
    }

    

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState)
        {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }            
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId)
    {
            this.state[objectId]= newState;
            this.stateChanged.next(this.state);
    }
}

