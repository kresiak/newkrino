import {Component, OnInit} from '@angular/core'
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

    }

    categories: Observable<any>;
    openPanelId: string= "";

    ngOnInit():void{
        this.categories= this.productService.getAnnotatedCategories(); 
        this.categories.subscribe(category =>
            {
                var x= category;
            }             
        );
    }

    getCategoryObservable(id: string) : Observable<any>
    {
        return this.categories.map(categories=> categories.filter(s => s.data._id===id)[0]);
    }

    public beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) 
            this.openPanelId= $event.panelId;
    };
    
}

