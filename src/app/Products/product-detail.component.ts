import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { BasketService } from './../Shared/Services/basket.service'
import { OrderService } from './../Shared/Services/order.service'
import { ConfigService } from './../Shared/Services/config.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { Router } from '@angular/router'
import * as comparatorsUtils from './../Shared/Utils/comparators'
import * as utilsdate from './../Shared/Utils/dates'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-detail',
        templateUrl: './product-detail.component.html'
    }
)

export class ProductDetailComponent implements OnInit {
    serviceSnapshot: any;
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private navigationService: NavigationService,
        private authService: AuthService, private basketService: BasketService, private router: Router, private configService: ConfigService) {
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

    private basketPorductsMap: Map<string, any> = new Map<string, any>()

    private isPageRunning: boolean = true

    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.categoryIds);

        this.selectableUsers = this.authService.getSelectableUsers();
        this.selectedUserIdsObservable = this.productObservable.map(product => product.data.userIds);

        this.productObservable.takeWhile(() => this.isPageRunning)
            .do(product => {
                if (!comparatorsUtils.softCopy(this.product, product))
                    this.product = product;
                this.productService.setBasketInformationOnProducts(this.basketPorductsMap, [this.product])
                this.ordersObservable = this.orderService.getAnnotedOrdersByProduct(product.data._id)
                this.doubleProductsObservable = this.productService.getAnnotatedProductsByCatalogNr(product.data.catalogNr)
            }).switchMap(product => {
                return this.productService.getAnnotatedProductsByCatalogNr(product.data.catalogNr)
            }).do(res => {
                this.hasProductDoubles = res && res.length > 1
            }).switchMap(res => {
                if (this.product.data.serviceVersionId) return this.dataStore.getDataObservable('platform.service.snapshots').map(snapshots => snapshots.filter(s => s._id === this.product.data.serviceVersionId)[0])
                else return Observable.from([undefined])
            }).do(snapshot => {
                this.serviceSnapshot = snapshot
            }).subscribe(res => { })

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })

        this.basketService.getBasketProductsSetForCurrentUser().subscribe(basketPorductsMap => {
            this.basketPorductsMap = basketPorductsMap
            this.productService.setBasketInformationOnProducts(this.basketPorductsMap, [this.product])
        })

    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    isProductReadOnly() {
        return !this.authorizationStatusInfo || !this.authorizationStatusInfo.isRightAdministrator(this.product.annotation.isPublic)
    }

    isLaboSpecificChangePossible() {
        return this.authorizationStatusInfo && (this.authorizationStatusInfo.isProgrammer() || (!this.product.annotation.isPublic && this.authorizationStatusInfo.isSuperAdministrator()))
    }

    //private model;
    private product;
    private hasProductDoubles: boolean = false
    private ordersObservable;
    private doubleProductsObservable
    private selectableUsers: Observable<SelectableData[]>;
    private selectedUserIdsObservable: Observable<any>;
    private selectableCategoriesObservable: Observable<SelectableData[]>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;

    private logHistory(event: string, oldValue, newValue) {
        if (!this.product.data.history) this.product.data.history = []
        this.product.data.history.push({
            date: utilsdate.nowFormated(),
            userId: this.authorizationStatusInfo.getCurrentUserName(),
            event: event,
            oldValue: oldValue,
            newValue: newValue
        })
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.logHistory('category change', this.product.data.categoryIds, selectedIds)
        this.product.data.categoryIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    userSelectionChanged(selectedIds: string[]) {
        this.logHistory('user change', this.product.data.userIds, selectedIds)
        this.product.data.userIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    quantityBasketUpdated(quantity: string) {
        this.basketService.doBasketUpdate(this.product, quantity)
    }

    quantityBasketIncremented() {
        this.basketService.doBasketUpdate(this.product, (+this.product.annotation.quantity + 1).toString())
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
        this.logHistory('name change', this.product.data.name, name)
        this.product.data.name = name;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    validationReask() {
        this.logHistory('validation asked again', '', '')
        this.product.data.onCreateValidation = true;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);        
    }

    validationDone() {
        this.logHistory('validation done', '', '')
        this.product.data.onCreateValidation = false;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    validationRefuse() {
        this.logHistory('validation refused', '', '')
        this.product.data.onCreateValidation = false        
        // todo: generate message to creation user: this.product.data.creatingUserId
        this.dataStore.updateData('products', this.product.data._id, this.product.data)
        this.dataStore.addData('messages', {
            userId: this.authorizationStatusInfo.currentUserId,
            message: 'PRODUCT.ACTIONS.REFUSER VALIDATION MSG',
            isPrivate: true,
            toUserId: this.product.data.creatingUserId,
            objectType: 'product',
            id: this.product.data._id,
            isRead: false
        })
    }

    packageUpdated(packName: string) {
        this.logHistory('package change', this.product.data.package, packName)
        this.product.data.package = packName;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    catalogNrUpdated(catNr: string) {
        this.logHistory('catalogNr change', this.product.data.catalogNr, catNr)
        this.product.data.catalogNr = catNr;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    priceProdUpdated(priceProd) {
        if (!this.product.data.priceUpdates) this.product.data.priceUpdates = []
        this.product.data.priceUpdates.unshift({ date: moment().format('DD/MM/YYYY HH:mm:ss'), newPrice: +priceProd, oldPrice: +this.product.data.price, userId: this.authorizationStatusInfo.currentUserId })
        this.product.data.price = +priceProd;
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
        this.logHistory('tva change', this.product.data.tva, tvaProd)
        this.product.data.tva = tvaProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    disablUpdated(isDisable) {
        this.logHistory('disable/enable', this.product.data.disabled, isDisable)
        this.product.data.disabled = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    gotoPreOrder() {
        let link = ['/preorder', this.product.data.supplierId];
        this.router.navigate(link);
    }

    isStockUpdated(isStock) {
        this.logHistory('isStock change', this.product.data.isStock, isStock)
        this.product.data.isStock = isStock;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    needsLotNumberUpdated(lotNumber) {
        this.logHistory('needsLotNumber change', this.product.data.needsLotNumber, lotNumber)
        this.product.data.needsLotNumber = lotNumber;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    divisionFactorUpdated(divisionFactor) {
        this.logHistory('divisionFactor change', this.product.data.divisionFactor, divisionFactor)
        this.product.data.divisionFactor = divisionFactor;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    stockPackageUpdated(stockPackage) {
        this.logHistory('stockPackage change', this.product.data.stockPackage, stockPackage)
        this.product.data.stockPackage = stockPackage;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    private saveFrigoProperty(event, product, isFrigo: boolean) {
        event.preventDefault()
        event.stopPropagation()
        this.logHistory('is Frigo change', this.product.data.isFrigo, isFrigo)
        product.data.isFrigo = isFrigo;
        this.dataStore.updateData('products', product.data._id, product.data);
    }

    descriptionUpdated(description) {
        this.logHistory('description change', this.product.data.description, description)
        this.product.data.description = description;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }

    isLabUpdated(isLabos) {
        this.logHistory('private product flag change', this.product.data.isLabo, isLabos)
        this.product.data.isLabo = isLabos;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    }


}