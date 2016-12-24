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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var data_service_1 = require('./data.service');
var auth_service_1 = require('./auth.service');
var product_service_1 = require('./product.service');
var order_service_1 = require('./order.service');
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var SupplierService = (function () {
    function SupplierService(dataStore, productService, orderService, authService) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.authService = authService;
    }
    SupplierService.prototype.getSupplier = function (supplierId) {
        return this.dataStore.getDataObservable('suppliers').map(function (suppliers) {
            var x = suppliers.filter(function (supplier) { return supplier._id === supplierId; });
            return x && x.length > 0 ? x[0] : null;
        });
    };
    SupplierService.prototype.getAnnotatedSuppliers = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('products'), this.productService.getBasketItemsForCurrentUser(), this.orderService.getSupplierFrequenceMapObservable(), this.productService.getVoucherMapForCurrentUser(), this.dataStore.getDataObservable('categories'), function (suppliers, produits, basketItems, supplierFrequenceMap, voucherMap, categories) {
            return suppliers.map(function (supplier) {
                return {
                    data: supplier,
                    annotation: {
                        hasBasket: _this.productService.hasSupplierBasketItems(supplier, produits, basketItems),
                        supplierFrequence: supplierFrequenceMap.get(supplier._id) || 0,
                        voucherCategoryMap: voucherMap.get(supplier._id) ? voucherMap.get(supplier._id)['categoryMap'] : undefined,
                        webShopping: {
                            categories: supplier.webShopping && supplier.webShopping.categoryIds ? supplier.webShopping.categoryIds.map(function (categoryId) {
                                var category = categories.filter(function (cat) { return cat._id === categoryId; })[0];
                                return {
                                    id: categoryId,
                                    name: category ? category.name : 'unknown category'
                                };
                            }) : []
                        }
                    }
                };
            });
        });
    };
    SupplierService.prototype.getAnnotatedSuppliersByFrequence = function () {
        return this.getAnnotatedSuppliers().map(function (prods) { return prods.sort(function (a, b) { return b.annotation.supplierFrequence - a.annotation.supplierFrequence; }); });
    };
    SupplierService.prototype.getAnnotatedSupplierById = function (id) {
        return this.getAnnotatedSuppliers().map(function (suppliers) {
            var supplier = suppliers.filter(function (s) { return s.data._id === id; })[0];
            return supplier ? supplier : null;
        });
    };
    SupplierService.prototype.getAnnotatedWebSuppliers = function () {
        return this.getAnnotatedSuppliers().map(function (annotatedSuppliers) { return annotatedSuppliers.filter(function (annotatedSupplier) { return annotatedSupplier.data.webShopping && annotatedSupplier.data.webShopping.isEnabled; }); });
    };
    SupplierService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(product_service_1.ProductService)),
        __param(2, core_1.Inject(order_service_1.OrderService)),
        __param(3, core_1.Inject(auth_service_1.AuthService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, auth_service_1.AuthService])
    ], SupplierService);
    return SupplierService;
}());
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map