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
var order_service_1 = require('./../Shared/Services/order.service');
var product_service_1 = require('./../Shared/Services/product.service');
var supplier_service_1 = require('./../Shared/Services/supplier.service');
var auth_service_1 = require('./../Shared/Services/auth.service');
var data_service_1 = require('./../Shared/Services/data.service');
var MyKrinoComponent = (function () {
    function MyKrinoComponent(orderService, productService, authService, dataStore, supplierService) {
        this.orderService = orderService;
        this.productService = productService;
        this.authService = authService;
        this.dataStore = dataStore;
        this.supplierService = supplierService;
        this.stateChanged = new core_1.EventEmitter();
    }
    MyKrinoComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    MyKrinoComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.suppliersWithBasketObservable = this.supplierService.getAnnotatedSuppliers().map(function (suppliers) { return suppliers.filter(function (supplier) { return supplier.annotation.hasBasket; }); });
        this.ordersObservable = this.orderService.getAnnotedOrdersOfCurrentUser();
        this.productsObservable = this.productService.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo();
        this.authService.getAnnotatedCurrentUser().subscribe(function (res) {
            _this.currentUser = res;
        });
        this.equipesObservable = this.orderService.getAnnotatedEquipesOfCurrentUser();
    };
    MyKrinoComponent.prototype.commentsUpdated = function (comments) {
        if (this.currentUser && comments) {
            this.currentUser.data.notes = comments;
            this.dataStore.updateData('krinousers', this.currentUser.data._id, this.currentUser.data);
        }
    };
    MyKrinoComponent.prototype.getEquipeObservable = function (id) {
        return this.equipesObservable.map(function (equipes) { return equipes.filter(function (s) { return s.data._id === id; })[0]; });
    };
    MyKrinoComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    MyKrinoComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    MyKrinoComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MyKrinoComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], MyKrinoComponent.prototype, "stateChanged", void 0);
    MyKrinoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './mykrino.component.html'
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, product_service_1.ProductService, auth_service_1.AuthService, data_service_1.DataStore, supplier_service_1.SupplierService])
    ], MyKrinoComponent);
    return MyKrinoComponent;
}());
exports.MyKrinoComponent = MyKrinoComponent;
//# sourceMappingURL=mykrino.component.js.map