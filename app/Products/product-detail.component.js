"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Rx_1 = require('rxjs/Rx');
var data_service_1 = require('./../Shared/Services/data.service');
var product_service_1 = require('./../Shared/Services/product.service');
var order_service_1 = require('./../Shared/Services/order.service');
var navigation_service_1 = require('./../Shared/Services/navigation.service');
var ProductDetailComponent = (function () {
    function ProductDetailComponent(dataStore, productService, orderService, navigationService) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.navigationService = navigationService;
        this.stateChanged = new core_1.EventEmitter();
    }
    ProductDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    ProductDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(function (product) { return product.data.categoryIds; });
        this.productObservable.subscribe(function (product) {
            _this.product = product;
            if (product) {
                _this.ordersObservable = _this.orderService.getAnnotedOrdersByProduct(product.data._id);
            }
        });
    };
    ProductDetailComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.product.data.categoryIds = selectedIds;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.productService.createCategory(newCategory);
    };
    ProductDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.product && comments) {
            this.product.data.comments = comments;
            this.dataStore.updateData('products', this.product.data._id, this.product.data);
        }
    };
    ProductDetailComponent.prototype.quantityBasketUpdated = function (quantity) {
        this.productService.doBasketUpdate(this.product, quantity);
    };
    ProductDetailComponent.prototype.beforeTabChange = function ($event) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/product', this.product.data._id, this.path, this.lastPath);
        }
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    ProductDetailComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    ProductDetailComponent.prototype.nameUpdated = function (name) {
        this.product.data.name = name;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.packageUpdated = function (packName) {
        this.product.data.package = packName;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.catalogNrUpdated = function (catNr) {
        this.product.data.catalogNr = catNr;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.priceProdUpdated = function (priceProd) {
        this.product.data.price = priceProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.noArticleUpdated = function (noArt) {
        this.product.data.noArticle = noArt;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.groupMarchUpdated = function (groupM) {
        this.product.data.groupMarch = groupM;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.tvaUpdated = function (tvaProd) {
        this.product.data.tva = tvaProd;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.resoldUpdated = function (resold) {
        this.product.data.isResold = resold;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.disablUpdated = function (isDisable) {
        this.product.data.disabled = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    ProductDetailComponent.prototype.distribUpdated = function (isDisable) {
        this.product.data.isDistributed = isDisable;
        this.dataStore.updateData('products', this.product.data._id, this.product.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ProductDetailComponent.prototype, "productObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ProductDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ProductDetailComponent.prototype, "path", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ProductDetailComponent.prototype, "lastPath", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ProductDetailComponent.prototype, "stateChanged", void 0);
    ProductDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product-detail',
            templateUrl: './product-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, navigation_service_1.NavigationService])
    ], ProductDetailComponent);
    return ProductDetailComponent;
}());
exports.ProductDetailComponent = ProductDetailComponent;
//# sourceMappingURL=product-detail.component.js.map