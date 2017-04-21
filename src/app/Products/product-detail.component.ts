import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { Router } from '@angular/router'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-detail',
        templateUrl: './product-detail.component.html'
    }
)

export class ProductDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private navigationService: NavigationService, private authService: AuthService, private router: Router) {
    }

    @Input() productObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     
    private subscriptionProduct: Subscription
    private subscriptionDoubleProduct: Subscription



    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.categoryIds);

        this.selectableUsers = this.authService.getSelectableUsers();
        this.selectedUserIdsObservable = this.productObservable.map(product => product.data.userIds);

        this.subscriptionProduct= this.productObservable.subscribe(product => {
            this.product = product;
            if (product) {
                this.ordersObservable = this.orderService.getAnnotedOrdersByProduct(product.data._id)
                this.doubleProductsObservable= this.productService.getAnnotatedProductsWithBasketInfoByCatalogNr(product.data.catalogNr)
                this.subscriptionDoubleProduct= this.doubleProductsObservable.subscribe(res => {
                    this.hasProductDoubles= res && res.length > 1
                })
            }
        });

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionProduct.unsubscribe()
         this.subscriptionDoubleProduct.unsubscribe()
    }
    

    //private model;
    private product;
    private hasProductDoubles: boolean= false
    private ordersObservable;
    private doubleProductsObservable
    private selectableUsers: Observable<SelectableData[]>;
    private selectedUserIdsObservable: Observable<any>;
    private selectableCategoriesObservable: Observable<SelectableData[]>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;

    categorySelectionChanged(selectedIds: string[]) {
        this.product.data.categoryIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    userSelectionChanged(selectedIds: string[]) {
        this.product.data.userIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    commentsUpdated(comments) {
        if (this.product && comments) {
            this.product.data.comments = comments;
            this.dataStore.updateData('products', this.product.data._id, this.product.data);
        }

    }

    quantityBasketUpdated(quantity: string) {
        this.productService.doBasketUpdate(this.product, quantity)
    }

    quantityBasketIncremented() {        
        this.productService.doBasketUpdate(this.product, (+this.product.annotation.quantity + 1).toString() )
        this.product.annotation.quantity++ // to display it more rapidly, even if the observable would bring it anyway
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/product', this.product.data._id, this.path, this.isRoot)
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

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    private childDoubleProductsStateChanged($event) {
        this.state.DoubleProducts = $event;
        this.stateChanged.next(this.state);
    }    


    nameUpdated(name: string) {
        this.product.data.name = name;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    packageUpdated(packName: string) {
        this.product.data.package = packName;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    catalogNrUpdated(catNr: string) {
        this.product.data.catalogNr = catNr;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    priceProdUpdated(priceProd) {
        this.product.data.price = priceProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    noArticleUpdated(noArt: string) {
        this.product.data.noArticle = noArt;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    groupMarchUpdated(groupM: string) {
        this.product.data.groupMarch = groupM;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    tvaUpdated(tvaProd: number) {
        this.product.data.tva = tvaProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    disablUpdated(isDisable) {
        this.product.data.disabled = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    gotoPreOrder() {
        let link = ['/preorder', this.product.data.supplierId];
        this.router.navigate(link);
    }
    
    isStockUpdated(isStock) {
        this.product.data.isStock = isStock;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    needsLotNumberUpdated(lotNumber) {
        this.product.data.needsLotNumber = lotNumber;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    divisionFactorUpdated(divisionFactor) {
        this.product.data.divisionFactor = divisionFactor;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    stockPackageUpdated(stockPackage) {
        this.product.data.stockPackage = stockPackage;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    private saveFrigoProperty(event, product, isFrigo: boolean) {
        event.preventDefault()
        event.stopPropagation()
        product.data.isFrigo = isFrigo;
        this.dataStore.updateData('products', product.data._id, product.data);
    }
    
    descriptionUpdated(description) {
        this.product.data.description = description;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }
    
}