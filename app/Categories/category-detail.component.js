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
var order_service_1 = require('./../Shared/Services/order.service');
var product_service_1 = require('./../Shared/Services/product.service');
var CategoryDetailComponent = (function () {
    function CategoryDetailComponent(dataStore, productService, orderService) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.stateChanged = new core_1.EventEmitter();
    }
    CategoryDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    CategoryDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.categoryObservable.subscribe(function (category) {
            _this.category = category;
            if (category) {
                _this.productsObservable = _this.productService.getAnnotatedProductsWithBasketInfoByCategory(category.data._id);
                _this.otpsObservable = _this.orderService.getAnnotatedOpenOtpsByCategory(category.data._id);
            }
        });
    };
    CategoryDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.category && comments) {
            this.category.data.comments = comments;
            this.dataStore.updateData('categories', this.category.data._id, this.category.data);
        }
    };
    CategoryDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    CategoryDetailComponent.prototype.childProductsStateChanged = function ($event) {
        this.state.Products = $event;
        this.stateChanged.next(this.state);
    };
    CategoryDetailComponent.prototype.childOtpsStateChanged = function ($event) {
        this.state.Otps = $event;
        this.stateChanged.next(this.state);
    };
    CategoryDetailComponent.prototype.dateUpdated = function (isBlocked) {
        this.category.data.isBlocked = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    CategoryDetailComponent.prototype.isLabUpdated = function (isBlocked) {
        this.category.data.isLabo = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    CategoryDetailComponent.prototype.isOfficUpdated = function (isBlocked) {
        this.category.data.isOffice = isBlocked;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    CategoryDetailComponent.prototype.nameCatUpdated = function (nameCat) {
        this.category.data.name = nameCat;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    CategoryDetailComponent.prototype.noArticleUpdated = function (noArt) {
        this.category.data.noArticle = noArt;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    CategoryDetailComponent.prototype.groupMUpdated = function (grMarch) {
        this.category.data.groupMarch = grMarch;
        this.dataStore.updateData('categories', this.category.data._id, this.category.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], CategoryDetailComponent.prototype, "categoryObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CategoryDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], CategoryDetailComponent.prototype, "stateChanged", void 0);
    CategoryDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-category-detail',
            templateUrl: './category-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService])
    ], CategoryDetailComponent);
    return CategoryDetailComponent;
}());
exports.CategoryDetailComponent = CategoryDetailComponent;
//# sourceMappingURL=category-detail.component.js.map