import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-prestation-detail',
        templateUrl: './prestation-detail.html'
    }
)
export class PrestationDetailComponent implements OnInit {
    constructor() {
    }

    @Input() prestationObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged= new EventEmitter();
    private prestation: any;

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }    

/*    private getManipsObservable(): Observable<any>
    {
        return this.prestationObservable.map(prestation => prestation.annotation.manips);
    }
*/
    ngOnInit(): void {
        this.stateInit();
        this.prestationObservable.subscribe(prestation => {
            this.prestation = prestation;
        });
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };


}