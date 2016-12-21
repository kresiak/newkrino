import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import {ProductService} from './../Shared/Services/product.service'
import {Observable} from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
 {
     moduleId: module.id,
     templateUrl: './category-list.component.html'
 }
)
export class CategoryListComponent implements OnInit{
    constructor(private productService: ProductService)    {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    categoryObservable: Observable<any>;
    categories: any
    openPanelId: string= "";
    @Input() state;
    @Output() stateChanged= new EventEmitter();
    
    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;    

    ngOnInit():void{
        this.stateInit();
        this.categoryObservable= this.productService.getAnnotatedCategories(); 

        Observable.combineLatest(this.categoryObservable, this.searchControl.valueChanges.startWith(''), (categories, searchTxt: string) => {
            if (searchTxt.trim() === '') return categories;
            return categories.filter(category => category.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || category.data.name.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(categories => this.categories = categories);
        
    }

    getCategoryObservable(id: string) : Observable<any>
    {
        return this.categoryObservable.map(categories=> categories.filter(s => {
            return s.data._id===id
        }

        )[0]);
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

