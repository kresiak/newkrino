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
var Rx_1 = require('rxjs/Rx');
var router_1 = require('@angular/router');
var SupplierDetailComponent = (function () {
    function SupplierDetailComponent(productService, orderService, router) {
        this.productService = productService;
        this.orderService = orderService;
        this.router = router;
        this.isThereABasket = false;
    }
    SupplierDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.supplierObservable.subscribe(function (supplier) {
            _this.supplier = supplier;
            _this.productsObservable = _this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier._id);
            _this.productsBasketObservable = _this.productService.getAnnotatedProductsInBasketBySupplier(supplier._id);
            _this.productsBasketObservable.subscribe(function (products) { return _this.isThereABasket = products && products.length > 0; });
            _this.ordersObservable = _this.orderService.getAnnotedOrdersBySupplier(supplier._id);
            _this.ordersObservable.subscribe(function (orders) { return _this.anyOrder = orders && orders.length > 0; });
        });
    };
    SupplierDetailComponent.prototype.gotoPreOrder = function () {
        var link = ['/preorder', this.supplier._id];
        this.router.navigate(link);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], SupplierDetailComponent.prototype, "supplierObservable", void 0);
    SupplierDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-supplier-detail',
            templateUrl: './supplier-detail.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService, order_service_1.OrderService, router_1.Router])
    ], SupplierDetailComponent);
    return SupplierDetailComponent;
}());
exports.SupplierDetailComponent = SupplierDetailComponent;
//# sourceMappingURL=supplier-detail.component.js.map