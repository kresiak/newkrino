import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ProductService } from './../Shared/Services/product.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from './../Shared/Services/config.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-category-list',
        templateUrl: './category-list.component.html'
    }
)
export class CategoryListComponent implements OnInit {
    constructor(private productService: ProductService, private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
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

    searchControl = new FormControl();
    searchForm;

    private listName = 'categoryList'
    private showSearch: boolean = false

    ngOnInit(): void {
        this.stateInit();
        var initialSearch = this.configService.listGetSearchText(this.listName)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }

        this.subscriptionCategories = Observable.combineLatest(this.categoryObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch), (categories, searchTxt: string) => {
            this.configService.listSaveSearchText(this.listName, searchTxt)
            if (searchTxt.trim() === '') return categories;
            return categories.filter(category => category.data.name && (category.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || category.data.name.toUpperCase().includes(searchTxt.toUpperCase())));
        }).subscribe(categories => this.categories = categories);
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



}

