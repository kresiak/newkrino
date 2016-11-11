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
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var PrestationService = (function () {
    function PrestationService(dataStore, authService, productService) {
        this.dataStore = dataStore;
        this.authService = authService;
        this.productService = productService;
    }
    PrestationService.prototype.createAnnotatedManip = function (manip, labels, productsAnnotated) {
        if (!manip)
            return null;
        var label = labels.filter(function (label) { return label._id === manip.labelId; })[0];
        return {
            data: manip,
            annotation: {
                label: label ? label.name : 'unknown label',
                products: productsAnnotated.filter(function (product) { return product.data.manipIds.includes(manip._id); })
            }
        };
    };
    PrestationService.prototype.getAnnotatedManips = function (manipsObservable) {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable("labels"), manipsObservable, this.productService.getAnnotatedProductsWithBasketInfo(this.dataStore.getDataObservable('Produits').map(function (products) { return products.filter(function (product) { return product.manipIds; }); })), function (labels, manips, products) {
            return manips.map(function (manip) { return _this.createAnnotatedManip(manip, labels, products); });
        });
    };
    PrestationService.prototype.getAnnotatedManipsAll = function () {
        return this.getAnnotatedManips(this.dataStore.getDataObservable("manips"));
    };
    PrestationService.prototype.getAnnotatedManipsByLabel = function (labelId) {
        return this.getAnnotatedManips(this.dataStore.getDataObservable("manips").map(function (manips) { return manips.filter(function (manip) { return manip.labelId === labelId; }); }));
    };
    PrestationService.prototype.createAnnotatedPrestation = function (prestation, labels, annotatedManips, usersAnnotated, nbAvailableInStockByProduct) {
        if (!prestation)
            return null;
        var label = labels.filter(function (label) { return label._id === prestation.labelId; })[0];
        return {
            data: prestation,
            annotation: {
                label: label ? label.name : 'unknown label',
                manips: !prestation.manips || prestation.manips.length === 0 ? null : prestation.manips.map(function (manip) {
                    var manipAnnotated = annotatedManips.filter(function (annotatedManip) { return annotatedManip.data._id === manip.manipId; })[0];
                    return {
                        data: manip,
                        annotation: {
                            manipName: manipAnnotated ? manipAnnotated.data.name : 'unknown manip',
                            worklogs: !manip.worklogs ? null : manip.worklogs.map(function (log) {
                                var logUserAnnotated = usersAnnotated.filter(function (user) { return user.data._id === log.userId; })[0];
                                return {
                                    data: log,
                                    annotation: {
                                        userFullName: logUserAnnotated ? logUserAnnotated.annotation.fullName : 'unknown user'
                                    } };
                            }),
                            products: !manip.products ? null : manip.products.map(function (product) {
                                var productAnnotated = manipAnnotated && manipAnnotated.annotation.products ?
                                    manipAnnotated.annotation.products.filter(function (prodAnnot) { return prodAnnot.data._id === product.productId; })[0] : null;
                                var nbAvailableInStockRecord = nbAvailableInStockByProduct.filter(function (stockProd) { return stockProd.productId === product.productId; })[0];
                                return {
                                    data: product,
                                    annotation: {
                                        productName: productAnnotated ? productAnnotated.data.Description : 'unknowProduit',
                                        nbAvailableInStock: nbAvailableInStockRecord ? nbAvailableInStockRecord : 0
                                    }
                                };
                            })
                        } };
                })
            }
        };
    };
    PrestationService.prototype.getAnnotatedPrestations = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable("labels"), this.dataStore.getDataObservable("prestations"), this.getAnnotatedManipsAll(), this.authService.getAnnotatedUsers(), this.productService.getNbAvailableInStockByProduct(), function (labels, prestations, manipsAnnotated, usersAnnotated, nbAvailableInStockByProduct) {
            return prestations.sort(function (cat1, cat2) { return cat1.reference < cat2.reference ? -1 : 1; })
                .map(function (prestation) { return _this.createAnnotatedPrestation(prestation, labels, manipsAnnotated, usersAnnotated, nbAvailableInStockByProduct); });
        });
    };
    PrestationService.prototype.updatePrestation = function (prestation) {
        this.dataStore.updateData('prestations', prestation._id, prestation);
    };
    PrestationService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(auth_service_1.AuthService)),
        __param(2, core_1.Inject(product_service_1.ProductService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, auth_service_1.AuthService, product_service_1.ProductService])
    ], PrestationService);
    return PrestationService;
}());
exports.PrestationService = PrestationService;
//# sourceMappingURL=prestation.service.js.map