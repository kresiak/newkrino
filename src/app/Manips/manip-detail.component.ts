import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-manip-detail',
        templateUrl: './manip-detail.component.html'
    }
)
export class ManipDetailComponent implements OnInit {
    constructor() {
    }

    @Input() manipObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged= new EventEmitter();
    private manip: any;

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }    

    private getProductsObservable(): Observable<any>
    {
        return this.manipObservable.map(manip => manip.annotation.products);
    }

    ngOnInit(): void {
        this.stateInit();
        this.manipObservable.subscribe(manip => {
            this.manip = manip;
        });
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };


}