import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"


@Component(
    {
        moduleId: module.id,
        selector: 'gg-category-detail',
        templateUrl: './category-detail.component.html'
    }
)

export class CategoryDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService) {
    }

    @Input() categoryObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
        this.categoryObservable.subscribe(category => {
            this.category = category;
            this.productsObservable= this.productService.getAnnotatedProductsWithBasketInfoByCategory(category.data._id)
        })
    }

    //private model;
    private category
    private productsObservable : Observable<any> 

    commentsUpdated(comments) {
        if (this.category && comments) {
            this.category.data.comments = comments;
            this.dataStore.updateData('categories', this.category.data._id, this.category.data);
        }
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childProductsStateChanged($event) {
        this.state.Products = $event;
        this.stateChanged.next(this.state);
    }    

    dateUpdated(isBlocked) {
        this.category.data.isBlocked = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    isLabUpdated(isBlocked) {
        this.category.data.isLabo = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    isOfficUpdated(isBlocked) {
        this.category.data.isOffice = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    nameCatUpdated(nameCat: string) {
        this.category.data.name = nameCat;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    noArticleUpdated(noArt: string) {
        this.category.data.noArticle = noArt;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    groupMUpdated(grMarch: string) {
        this.category.data.groupMarch = grMarch;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }
}