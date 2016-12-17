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
var product_service_1 = require('./../Shared/Services/product.service');
var order_service_1 = require('./../Shared/Services/order.service');
var data_service_1 = require('./../Shared/Services/data.service');
var Rx_1 = require('rxjs/Rx');
var router_1 = require('@angular/router');
var SupplierDetailComponent = (function () {
    function SupplierDetailComponent(dataStore, productService, orderService, router) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.router = router;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
        this.isThereABasket = false;
    }
    SupplierDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
    };
    SupplierDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.supplierObservable.map(function (supplier) { return supplier.data.webShopping && supplier.data.webShopping.categoryIds ? supplier.data.webShopping.categoryIds : []; });
        this.supplierObservable.subscribe(function (supplier) {
            _this.supplier = supplier;
            if (supplier) {
                _this.productsObservable = _this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier.data._id);
                _this.productsBasketObservable = _this.productService.getAnnotatedProductsInBasketBySupplier(supplier.data._id);
                _this.productsBasketObservable.subscribe(function (products) { return _this.isThereABasket = products && products.length > 0; });
                _this.ordersObservable = _this.orderService.getAnnotedOrdersBySupplier(supplier.data._id);
                _this.orderService.hasSupplierAnyOrder(supplier.data._id).subscribe(function (anyOrder) { return _this.anyOrder = anyOrder; });
            }
        });
    };
    SupplierDetailComponent.prototype.gotoPreOrder = function () {
        var link = ['/preorder', this.supplier.data._id];
        this.router.navigate(link);
    };
    SupplierDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    SupplierDetailComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    SupplierDetailComponent.prototype.webShoppingUpdated = function (isEnabled) {
        if (!this.supplier.data.webShopping)
            this.supplier.data.webShopping = {};
        this.supplier.data.webShopping.isEnabled = isEnabled;
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    };
    SupplierDetailComponent.prototype.categorySelectionChanged = function (selectedIds) {
        if (!this.supplier.data.webShopping)
            this.supplier.data.webShopping = {};
        this.supplier.data.webShopping.categoryIds = selectedIds;
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    };
    SupplierDetailComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.productService.createCategory(newCategory);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], SupplierDetailComponent.prototype, "supplierObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SupplierDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], SupplierDetailComponent.prototype, "initialTab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SupplierDetailComponent.prototype, "stateChanged", void 0);
    SupplierDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-supplier-detail',
            templateUrl: './supplier-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, router_1.Router])
    ], SupplierDetailComponent);
    return SupplierDetailComponent;
}());
exports.SupplierDetailComponent = SupplierDetailComponent;
//# sourceMappingURL=supplier-detail.component.js.map