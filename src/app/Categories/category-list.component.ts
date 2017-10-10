import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { ProductService } from './../Shared/Services/product.service'
import { Observable, Subscription, Subject } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-category-list',
        templateUrl: './category-list.component.html'
    }
)
export class CategoryListComponent implements OnInit {
    nbHits: number;
    constructor(private productService: ProductService) {
    }

    @Input() categoryObservable: Observable<any>;
    categories: any
    openPanelId: string = "";
    subscriptionCategories: Subscription

    @Input() state;
    @Input() path: string = 'categories'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private searchObservable = new Subject() // used by searchbox

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionCategories = Observable.combineLatest(this.categoryObservable, this.searchObservable, (categories, searchTxt: string) => {
            if (searchTxt.trim() === '') return categories;
            return categories.filter(category => category.data.name && (category.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || category.data.name.toUpperCase().includes(searchTxt.toUpperCase())));
        }).subscribe(categories => {
            this.categories = categories
            this.nbHits = categories.length
        });
    }

    ngOnDestroy(): void {
        this.subscriptionCategories.unsubscribe()
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

