import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { ProductService } from './../Shared/Services/product.service';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-category-detail',
        templateUrl: './category-detail.component.html'
    }
)

export class CategoryDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private navigationService: NavigationService, private authService: AuthService) {
    }

    private subscriptionAuthorization: Subscription 
    private subscriptionCategory: Subscription

    @Input() categoryObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean= false
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
         this.subscriptionCategory= this.categoryObservable.subscribe(category => {
            this.category = category;
            if (category) {
                this.productsObservable= this.productService.getAnnotatedProductsWithBasketInfoByCategory(category.data._id)
                this.otpsObservable= this.orderService.getAnnotatedOpenOtpsByCategory(category.data._id)
            }
        });
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionCategory.unsubscribe()
    }
    
    //private model;
    private category
    private productsObservable : Observable<any> 
    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;

    commentsUpdated(comments) {
        if (this.category && comments) {
            this.category.data.comments = comments;
            this.dataStore.updateData('categories', this.category.data._id, this.category.data);
        }
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/category', this.category.data._id, this.path, this.isRoot)
            return
        }
        if ($event.nextId === 'gotoTop') {
            $event.preventDefault();
            this.navigationService.jumpToTop()
            return
        }        
        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childProductsStateChanged($event) {
        this.state.Products = $event;
        this.stateChanged.next(this.state);
    }    

    private childOtpsStateChanged($event)
    {
        this.state.Otps= $event;
        this.stateChanged.next(this.state);
    }

    dateUpdated(isBlockeds) {
        this.category.data.isBlocked = isBlockeds;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    isLabUpdated(isLabos) {
        this.category.data.isLabo = isLabos;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    }

    isOfficUpdated(isOffices) {
        this.category.data.isOffice = isOffices;
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