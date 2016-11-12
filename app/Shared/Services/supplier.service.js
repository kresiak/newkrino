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
var product_service_1 = require('./product.service');
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var SupplierService = (function () {
    function SupplierService(dataStore, productService) {
        this.dataStore = dataStore;
        this.productService = productService;
    }
    SupplierService.prototype.getSupplier = function (supplierId) {
        return this.dataStore.getDataObservable('suppliers').map(function (suppliers) {
            var x = suppliers.filter(function (supplier) { return supplier._id === supplierId; });
            return x && x.length > 0 ? x[0] : null;
        });
    };
    SupplierService.prototype.getAnnotatedSuppliers = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('products'), this.productService.getBasketItemsForCurrentUser(), function (suppliers, produits, basketItems) {
            return suppliers.map(function (supplier) {
                return {
                    data: supplier,
                    annotation: {
                        hasBasket: _this.productService.hasSupplierBasketItems(supplier, produits, basketItems)
                    }
                };
            });
        });
    };
    SupplierService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(product_service_1.ProductService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService])
    ], SupplierService);
    return SupplierService;
}());
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map