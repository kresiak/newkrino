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
var auth_service_1 = require('./../Shared/Services/auth.service');
var order_service_1 = require('./../Shared/Services/order.service');
var data_service_1 = require('./../Shared/Services/data.service');
var Rx_1 = require('rxjs/Rx');
var router_1 = require('@angular/router');
var navigation_service_1 = require('./../Shared/Services/navigation.service');
var SupplierDetailComponent = (function () {
    function SupplierDetailComponent(dataStore, productService, orderService, router, authService, navigationService) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.router = router;
        this.authService = authService;
        this.navigationService = navigationService;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
        this.isThereABasket = false;
    }
    SupplierDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
        //if (!this.state.selectedWebShoppingTabId) this.state.selectedWebShoppingTabId = this.initialTab;        
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
                _this.authService.getAnnotatedCurrentUser().subscribe(function (user) {
                    _this.currentAnnotatedUser = user;
                });
            }
        });
    };
    SupplierDetailComponent.prototype.gotoPreOrder = function () {
        var link = ['/preorder', this.supplier.data._id];
        this.router.navigate(link);
    };
    SupplierDetailComponent.prototype.beforeTabChange = function ($event) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/supplier', this.supplier.data._id, this.path, this.lastPath);
        }
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    SupplierDetailComponent.prototype.beforeWebShoppingTabChange = function ($event) {
        this.state.selectedWebShoppingTabId = $event.nextId;
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
    SupplierDetailComponent.prototype.nbVouchersOrdered = function (categoryId) {
        return this.supplier.annotation.voucherCategoryMap && this.supplier.annotation.voucherCategoryMap.has(categoryId) ? this.supplier.annotation.voucherCategoryMap.get(categoryId).nbVouchersOrdered : 0;
    };
    SupplierDetailComponent.prototype.nbVouchersOrderedUpdated = function (categoryId, nbOrdered) {
        var _this = this;
        if (!this.currentAnnotatedUser.data.voucherRequests)
            this.currentAnnotatedUser.data.voucherRequests = [];
        var request = this.currentAnnotatedUser.data.voucherRequests.filter(function (request) { return request.supplierId === _this.supplier.data._id && request.categoryId === categoryId; })[0];
        if (!request) {
            if (nbOrdered === 0)
                return;
            request = {
                supplierId: this.supplier.data._id,
                categoryId: categoryId
            };
            this.currentAnnotatedUser.data.voucherRequests.push(request);
        }
        if (nbOrdered === 0) {
            var index = this.currentAnnotatedUser.data.voucherRequests.findIndex(function (req) { return req === request; });
            this.currentAnnotatedUser.data.voucherRequests.splice(index, 1);
        }
        request.quantity = nbOrdered;
        this.dataStore.updateData('users.krino', this.currentAnnotatedUser.data._id, this.currentAnnotatedUser.data);
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
    ], SupplierDetailComponent.prototype, "path", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], SupplierDetailComponent.prototype, "lastPath", void 0);
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
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, router_1.Router, auth_service_1.AuthService, navigation_service_1.NavigationService])
    ], SupplierDetailComponent);
    return SupplierDetailComponent;
}());
exports.SupplierDetailComponent = SupplierDetailComponent;
//# sourceMappingURL=supplier-detail.component.js.map