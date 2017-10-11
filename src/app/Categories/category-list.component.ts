import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable, Subject } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        selector: 'gg-category-list',
        templateUrl: './category-list.component.html'
    }
)
export class CategoryListComponent implements OnInit {
    constructor() {
    }

    @Input() categoryObservable: Observable<any>;
    categories: any
    openPanelId: string = "";

    @Input() state;
    @Input() path: string = 'categories'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private searchObservable = new Subject() // used by searchbox

    filterCategories(category, txt) { 
        return category.data.name && (category.data.name.toUpperCase().includes(txt))
    }

    ngOnInit(): void {
        this.stateInit();
    }

    ngOnDestroy(): void {
    }


    getCategoryObservable(id: string): Observable<any> {
        return this.categoryObservable.map(categories => categories.filter(s => {
            return s.data._id === id
        }

        )[0]);
    }
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private getIsLaboText(category) {
        return category.data.isLabo ? 'GENERAL.YES' : 'GENERAL.EMPTY'
    }

}

