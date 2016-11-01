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
var api_service_1 = require('./api.service');
var otp_choice_service_1 = require('./otp-choice.service');
var order_service_1 = require('./order.service');
var selectable_data_1 = require('./../Classes/selectable-data');
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var ProductService = (function () {
    function ProductService(dataStore, authService, apiService, otpChoiceService, orderService) {
        this.dataStore = dataStore;
        this.authService = authService;
        this.apiService = apiService;
        this.otpChoiceService = otpChoiceService;
        this.orderService = orderService;
    }
    // categories
    // ==========
    ProductService.prototype.getSelectableCategories = function () {
        return this.dataStore.getDataObservable('Categories').map(function (categories) {
            return categories.sort(function (cat1, cat2) { return cat1.Description < cat2.Description ? -1 : 1; }).map(function (category) {
                return new selectable_data_1.SelectableData(category._id, category.Description);
            });
        });
    };
    ProductService.prototype.createCategory = function (newCategory) {
        this.dataStore.addData('Categories', { 'Description': newCategory });
    };
    ProductService.prototype.getAnnotatedCategories = function () {
        return Rx_1.Observable.combineLatest(this.getAnnotatedProducts(), this.dataStore.getDataObservable('Categories'), this.dataStore.getDataObservable('otps'), function (productsAnnotated, categories, otps) {
            return categories.map(function (category) {
                var suppliersInCategory = productsAnnotated.filter(function (product) { return product.data.Categorie && product.data.Categorie.includes(category._id); }).map(function (product) { return product.annotation.supplierName; })
                    .reduce(function (a, b) {
                    if (a.indexOf(b) < 0)
                        a.push(b);
                    return a;
                }, []).slice(0, 2);
                var otpInCategory = otps.filter(function (otp) { return otp.Categorie && otp.Categorie.includes(category._id); }).map(function (otp) { return otp.Name; })
                    .reduce(function (a, b) {
                    if (a.indexOf(b) < 0)
                        a.push(b);
                    return a;
                }, []).slice(0, 2);
                return {
                    data: category,
                    annotation: {
                        supplierNames: suppliersInCategory,
                        otpNames: otpInCategory
                    }
                };
            });
        });
    };
    // products
    // ========
    ProductService.prototype.updateProduct = function (product) {
        this.dataStore.updateData('Produits', product._id, product);
    };
    ProductService.prototype.createProduct = function (product) {
        return this.dataStore.addData('Produits', product);
    };
    ProductService.prototype.getProductsBySupplier = function (supplierId) {
        return this.dataStore.getDataObservable('Produits').map(function (produits) { return produits.filter(function (produit) { return produit.Supplier === supplierId; }); });
    };
    ProductService.prototype.getAnnotedProductsBySupplier = function (supplierId) {
        return Rx_1.Observable.combineLatest(this.getProductsBySupplier(supplierId), this.getBasketItemsForCurrentUser(), function (products, basketItems) {
            return products.map(function (product) {
                var basketItemFiltered = basketItems.filter(function (item) { return item.produit === product._id; });
                return {
                    data: product,
                    annotation: {
                        basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                        quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0
                    }
                };
            });
        });
    };
    ProductService.prototype.getAnnotatedProducts = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable("Produits"), this.dataStore.getDataObservable("Suppliers"), function (produits, suppliers) {
            return produits.map(function (produit) {
                var supplier = suppliers.filter(function (supplier) { return supplier._id === produit.Supplier; })[0];
                return {
                    data: produit,
                    annotation: {
                        supplierName: supplier ? supplier.Nom : "unknown"
                    }
                };
            });
        });
    };
    // basket
    // ======
    //    get basket
    //    ==========
    ProductService.prototype.hasSupplierBasketItems = function (supplier, produits, basketitems) {
        return produits.filter(function (produit) { return produit.Supplier === supplier._id; }).filter(function (produit) { return basketitems.map(function (item) { return item.produit; }).includes(produit._id); }).length > 0;
    };
    ProductService.prototype.getBasketItemsForCurrentUser = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('basket'), this.authService.getUserIdObservable(), function (basket, userId) {
            return basket.filter(function (basketItem) { return basketItem.user === userId; });
        });
    };
    ProductService.prototype.getAnnotedProductsInBasketBySupplier = function (supplierId) {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.getProductsBySupplier(supplierId), this.getBasketItemsForCurrentUser(), this.orderService.getAnnotatedOtps(), function (products, basketItems, otps) {
            return products.filter(function (product) { return basketItems.map(function (item) { return item.produit; }).includes(product._id); })
                .map(function (product) {
                var basketItemFiltered = basketItems.filter(function (item) { return item.produit === product._id; });
                return basketItemFiltered && basketItemFiltered.length > 0 ? {
                    data: product,
                    annotation: {
                        basketId: basketItemFiltered[0]._id,
                        quantity: basketItemFiltered[0].quantity,
                        totalPrice: product.Prix * basketItemFiltered[0].quantity * 1.21,
                        otp: _this.otpChoiceService.determineOtp(product, basketItemFiltered[0].quantity, otps)
                    }
                } : null;
            });
        });
    };
    //     modify basket
    //     =============
    ProductService.prototype.createBasketItem = function (product, quantity) {
        this.dataStore.addData('basket', { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    };
    ProductService.prototype.updateBasketItem = function (basketItemId, product, quantity) {
        this.dataStore.updateData('basket', basketItemId, { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    };
    ProductService.prototype.removeBasketItem = function (basketItemId) {
        this.dataStore.deleteData('basket', basketItemId);
    };
    //     create order from basket
    //     ========================
    ProductService.prototype.passCommand = function (record) {
        var _this = this;
        var obs = this.apiService.callWebService('passOrder', record).map(function (res) { return res.json(); });
        obs.subscribe(function (res) {
            _this.dataStore.triggerDataNext('basket');
            _this.dataStore.triggerDataNext('orders');
        });
        return obs;
    };
    ProductService.prototype.createOrderFromBasket = function (products, supplierId) {
        if (!products || products.length < 1)
            return null;
        if (products.filter(function (product) { return !product.annotation.otp._id; }).length > 0)
            return null;
        var record = {
            data: {
                userId: this.authService.getUserId(),
                equipeId: this.authService.getEquipeId(),
                supplierId: supplierId,
                items: products.filter(function (product) { return product.annotation.quantity > 0; }).map(function (product) {
                    return {
                        product: product.data._id,
                        quantity: product.annotation.quantity,
                        otp: product.annotation.otp._id,
                        total: product.annotation.totalPrice
                    };
                })
            },
            basketItems: products.filter(function (product) { return product.annotation.quantity > 0; }).map(function (product) { return product.annotation.basketId; })
        };
        return this.passCommand(record);
    };
    ProductService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(auth_service_1.AuthService)),
        __param(2, core_1.Inject(api_service_1.ApiService)),
        __param(3, core_1.Inject(otp_choice_service_1.OtpChoiceService)),
        __param(4, core_1.Inject(order_service_1.OrderService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, auth_service_1.AuthService, api_service_1.ApiService, otp_choice_service_1.OtpChoiceService, order_service_1.OrderService])
    ], ProductService);
    return ProductService;
}());
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map