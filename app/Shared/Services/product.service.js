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
var moment = require("moment");
core_1.Injectable();
var ProductService = (function () {
    function ProductService(dataStore, authService, apiService, otpChoiceService, orderService) {
        this.dataStore = dataStore;
        this.authService = authService;
        this.apiService = apiService;
        this.otpChoiceService = otpChoiceService;
        this.orderService = orderService;
    }
    ProductService.prototype.getSelectableManips = function () {
        return this.dataStore.getDataObservable('manips').map(function (manips) {
            return manips.sort(function (cat1, cat2) { return cat1.name < cat2.name ? -1 : 1; }).map(function (manip) {
                return new selectable_data_1.SelectableData(manip._id, manip.name);
            });
        });
    };
    // stock
    // ==========
    ProductService.prototype.createAnnotatedStockProduct = function (productStock, annotatedOrders) {
        if (!productStock)
            return null;
        var annotatedOrder = annotatedOrders.filter(function (order) { return order.data._id === productStock.orderId; })[0];
        if (!annotatedOrder)
            return null;
        var annotatedOrderItem = annotatedOrder.annotation.items.filter(function (item) { return item.data.deliveries && item.data.deliveries.filter(function (delivery) { return delivery.stockId === productStock._id; }).length > 0; })[0];
        if (!annotatedOrderItem)
            return null;
        var delivery = annotatedOrderItem.data.deliveries.filter(function (delivery) { return delivery.stockId === productStock._id; })[0];
        if (!delivery)
            return null;
        var nbSold = !productStock.sales ? 0 : productStock.sales.reduce(function (acc, sale) { return acc + sale.quantity; }, 0);
        return {
            data: productStock,
            annotation: {
                supplier: annotatedOrder.annotation.supplier,
                product: annotatedOrderItem.annotation.description,
                nbInitialInStock: delivery.quantity,
                lotNb: delivery.lotNb,
                nbSold: nbSold,
                nbAvailable: delivery.quantity - nbSold,
                orderId: annotatedOrder.data._id
            }
        };
    };
    ProductService.prototype.getAnnotatedStockProducts = function (productsStockObservable) {
        var _this = this;
        return Rx_1.Observable.combineLatest(productsStockObservable, this.orderService.getAnnotedOrdersFromAll(), function (productsStock, annotatedOrders) {
            return productsStock.map(function (productStock) { return _this.createAnnotatedStockProduct(productStock, annotatedOrders); });
        });
    };
    ProductService.prototype.getAnnotatedAvailableStockProducts = function (productsStockObservable) {
        return this.getAnnotatedStockProducts(productsStockObservable)
            .map(function (annotatedStockProducts) { return annotatedStockProducts.filter(function (annotatedStockProduct) { return annotatedStockProduct && annotatedStockProduct.annotation.nbAvailable > 0; }); });
    };
    ProductService.prototype.getAnnotatedAvailableStockProductsAll = function () {
        return this.getAnnotatedAvailableStockProducts(this.dataStore.getDataObservable('products.stock')).map(function (sps) { return sps.groupBy(function (sp) { return sp.data.productId; }); });
    };
    ProductService.prototype.getNbAvailableInStockByProduct = function () {
        return this.getAnnotatedAvailableStockProductsAll().map(function (groups) {
            return groups.map(function (group) {
                return {
                    productId: group.key,
                    nbAvailable: group.values.reduce(function (acc, stockItem) { return acc + stockItem.annotation.nbAvailable; }, 0)
                };
            });
        });
    };
    // categories
    // ==========
    ProductService.prototype.getSelectableCategories = function () {
        return this.dataStore.getDataObservable('categories').map(function (categories) {
            return categories.sort(function (cat1, cat2) { return cat1.name < cat2.name ? -1 : 1; }).map(function (category) {
                return new selectable_data_1.SelectableData(category._id, category.name);
            });
        });
    };
    ProductService.prototype.createCategory = function (newCategory) {
        this.dataStore.addData('categories', { 'name': newCategory });
    };
    ProductService.prototype.getAnnotatedCategories = function () {
        return Rx_1.Observable.combineLatest(this.getAnnotatedProductsWithSupplierInfo(), this.dataStore.getDataObservable('categories'), this.dataStore.getDataObservable('otps'), function (productsAnnotated, categories, otps) {
            return categories.map(function (category) {
                var suppliersInCategory = productsAnnotated.filter(function (product) { return product.data.categoryIds && product.data.categoryIds.includes(category._id); }).map(function (product) { return product.annotation.supplierName; })
                    .reduce(function (a, b) {
                    if (a.indexOf(b) < 0)
                        a.push(b);
                    return a;
                }, []).slice(0, 2);
                var otpInCategory = otps.filter(function (otp) { return otp.categoryIds && otp.categoryIds.includes(category._id); }).map(function (otp) { return otp.name; })
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
    ProductService.prototype.getAnnotatedCategoriesById = function (id) {
        return this.getAnnotatedCategories().map(function (categories) { return categories.filter(function (s) {
            return s.data._id === id;
        })[0]; });
    };
    // products
    // ========
    ProductService.prototype.updateProduct = function (product) {
        this.dataStore.updateData('products', product._id, product);
    };
    ProductService.prototype.createProduct = function (product) {
        return this.dataStore.addData('products', product);
    };
    ProductService.prototype.getProductsBySupplier = function (supplierId) {
        return this.dataStore.getDataObservable('products').map(function (produits) { return produits.filter(function (produit) { return produit.supplierId === supplierId; }); });
    };
    ProductService.prototype.getProductsByCategory = function (categoryId) {
        return this.dataStore.getDataObservable('products').map(function (produits) { return produits.filter(function (produit) { return produit.categoryIds.includes(categoryId); }); });
    };
    ProductService.prototype.getProductsBoughtByUser = function (userIdObservable, ordersObservable) {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('products'), ordersObservable, userIdObservable, function (products, orders, userId) {
            var distinctProductIdsByUser = orders.filter(function (order) { return order.userId === userId; }).reduce(function (acc, order) {
                var items = order.items || [];
                items.forEach(function (item) {
                    if (!acc.includes(item.productId)) {
                        acc.push(item.productId);
                    }
                });
                return acc;
            }, []);
            return products.filter(function (product) { return distinctProductIdsByUser.includes(product._id); });
        });
    };
    ProductService.prototype.getAnnotatedProductsWithBasketInfo = function (productsObservable) {
        return Rx_1.Observable.combineLatest(productsObservable, this.getBasketItemsForCurrentUser(), this.dataStore.getDataObservable("suppliers"), this.orderService.getProductFrequenceMapObservable(), function (products, basketItems, suppliers, productFrequenceMap) {
            var mapSuppliers = suppliers.reduce(function (map, supplier) {
                map.set(supplier._id, supplier);
                return map;
            }, new Map());
            return products.map(function (product) {
                var supplier = mapSuppliers.get(product.supplierId); //suppliers.filter(supplier => supplier._id === product.supplierId)[0];
                var basketItemFiltered = basketItems.filter(function (item) { return item.produit === product._id; });
                return {
                    data: product,
                    annotation: {
                        basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                        quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0,
                        supplierName: supplier ? supplier.name : "unknown",
                        productFrequence: productFrequenceMap.get(product._id) || 0
                    }
                };
            });
        });
    };
    ProductService.prototype.getAnnotatedProductsWithBasketInfoAll = function () {
        return this.getAnnotatedProductsWithBasketInfo(this.dataStore.getDataObservable('products')).map(function (prods) {
            return prods.sort(function (a, b) { return b.annotation.productFrequence - a.annotation.productFrequence; });
        });
    };
    ProductService.prototype.getAnnotatedProductsWithBasketInfoById = function (id) {
        return this.getAnnotatedProductsWithBasketInfoAll().map(function (products) { return products.filter(function (product) { return product.data._id === id; })[0]; });
    };
    ProductService.prototype.getAnnotatedProductsWithBasketInfoBySupplier = function (supplierId) {
        return this.getAnnotatedProductsWithBasketInfo(this.getProductsBySupplier(supplierId)).map(function (prods) { return prods.sort(function (a, b) { return b.annotation.productFrequence - a.annotation.productFrequence; }); }).publishReplay(1).refCount();
    };
    ProductService.prototype.getAnnotatedProductsWithBasketInfoByCategory = function (categoryId) {
        return this.getAnnotatedProductsWithBasketInfo(this.getProductsByCategory(categoryId)).map(function (prods) { return prods.sort(function (a, b) { return b.annotation.productFrequence - a.annotation.productFrequence; }); });
    };
    ProductService.prototype.getAnnotatedProductsBoughtByCurrentUserWithBasketInfo = function () {
        var productsObservable = this.getProductsBoughtByUser(this.authService.getUserIdObservable(), this.dataStore.getDataObservable('orders'));
        return this.getAnnotatedProductsWithBasketInfo(productsObservable).publishReplay(1).refCount();
    };
    ProductService.prototype.getAnnotatedProductsWithSupplierInfo = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable("products"), this.dataStore.getDataObservable("suppliers"), function (produits, suppliers) {
            return produits.map(function (produit) {
                var supplier = suppliers.filter(function (supplier) { return supplier._id === produit.supplierId; })[0];
                return {
                    data: produit,
                    annotation: {
                        supplierName: supplier ? supplier.name : "unknown"
                    }
                };
            });
        });
    };
    // web shopping
    // ============
    // return map suppliedId => {
    //          supplierName: string,
    //          categoryMap: categoryId: string => {
    //                  categoryName: string,
    //                  nbVouchersOrdered: number,
    //                  vouchers: array of vouchers as in database
    //              }    
    //     }
    ProductService.prototype.getVoucherMapForCurrentUser = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('users.krino'), this.dataStore.getDataObservable('categories'), this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('orders.vouchers'), this.authService.getUserIdObservable(), function (users, categories, suppliers, vouchers, userId) {
            var user = users.filter(function (user) { return user._id === userId; })[0];
            var supplierMap = new Map();
            if (!user)
                return null;
            var initMapIfNecessary = function (supplierId, categoryId) {
                if (!supplierMap.has(supplierId)) {
                    supplierMap.set(supplierId, {
                        supplierName: suppliers.filter(function (supplier) { return supplier._id === supplierId; })[0] || 'unknown supplier',
                        categoryMap: new Map()
                    });
                }
                var categoryMap = supplierMap.get(supplierId)['categoryMap'];
                if (!categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, {
                        categoryName: categories.filter(function (category) { return category._id === categoryId; })[0] || 'unknown category',
                        nbVouchersOrdered: 0,
                        vouchers: []
                    });
                }
            };
            (user.voucherRequests || []).forEach(function (request) {
                initMapIfNecessary(request.supplierId, request.categoryId);
                supplierMap.get(request.supplierId)['categoryMap'].get(request.categoryId)['nbVouchersOrdered'] = request.quantity;
            });
            vouchers.filter(function (voucher) { return !voucher.shopping && voucher.userId === userId; }).forEach(function (voucher) {
                initMapIfNecessary(voucher.supplierId, voucher.categoryId);
                supplierMap.get(voucher.supplierId)['categoryMap'].get(voucher.categoryId)['vouchers'].push(voucher);
            });
            return supplierMap;
        });
    };
    ProductService.prototype.getOpenRequestedVouchers = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('users.krino'), this.dataStore.getDataObservable('categories'), this.dataStore.getDataObservable('suppliers'), function (users, categories, suppliers) {
            var list = [];
            users.filter(function (user) { return user.voucherRequests && user.voucherRequests.filter(function (req) { return req.quantity > 0; }).length > 0; }).forEach(function (user) {
                user.voucherRequests.forEach(function (request) {
                    if (request.quantity > 0) {
                        var supplier = suppliers.filter(function (supplier) { return supplier._id === request.supplierId; })[0];
                        var category = categories.filter(function (category) { return category._id === request.categoryId; })[0];
                        list.push({
                            userId: user._id,
                            userName: user.firstName + ' ' + user.name,
                            supplierId: request.supplierId,
                            supplierName: supplier ? supplier.name : 'unknown supplier',
                            categoryId: request.categoryId,
                            categoryName: category ? category.name : 'unknown category',
                            quantity: request.quantity
                        });
                    }
                });
            });
            return list.sort(function (a1, a2) {
                if (a1.supplierName === a2.supplierName) {
                    return a1.categoryName < a2.categoryName ? -1 : 1;
                }
                return a1.supplierName < a2.supplierName ? -1 : 1;
            });
        });
    };
    ProductService.prototype.createVoucher = function (record) {
        var _this = this;
        var obs = this.apiService.callWebService('createVoucher', record).map(function (res) { return res.json(); });
        obs.subscribe(function (res) {
            _this.dataStore.triggerDataNext('users.krino');
            _this.dataStore.triggerDataNext('orders.vouchers');
        });
        return obs;
    };
    ProductService.prototype.useVoucherForCurrentUser = function (supplierId, categoryId, amount, description) {
        var _this = this;
        var record = {
            userId: this.authService.getUserId(),
            equipeId: this.authService.getEquipeId(),
            supplierId: supplierId,
            categoryId: categoryId,
            amount: amount,
            description: description
        };
        var obs = this.apiService.callWebService('useVoucher', record).map(function (res) { return res.json(); });
        obs.subscribe(function (res) {
            if (!res.error)
                _this.dataStore.triggerDataNext('orders.vouchers');
        });
        return obs;
    };
    ProductService.prototype.createAnnotatedVoucher = function (voucher, users, categories, suppliers, equipes) {
        if (!voucher)
            return null;
        var user = users.filter(function (user) { return user._id === voucher.userId; })[0];
        var category = categories.filter(function (category) { return category._id === voucher.categoryId; })[0];
        var supplier = suppliers.filter(function (supplier) { return supplier._id === voucher.supplierId; })[0];
        var equipe = !voucher.shopping ? null : equipes.filter(function (equipe) { return equipe._id === voucher.shopping.equipeId; })[0];
        return {
            data: voucher,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'unknown user',
                category: category ? category.name : 'unknown category',
                supplier: supplier ? supplier.name : 'unknown supplier',
                isUsed: voucher.shopping ? true : false,
                equipe: equipe ? equipe.name : 'not yet equipe'
            }
        };
    };
    ProductService.prototype.getAnnotatedVouchers = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('orders.vouchers'), this.dataStore.getDataObservable('users.krino'), this.dataStore.getDataObservable('categories'), this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('equipes'), function (vouchers, users, categories, suppliers, equipes) {
            return vouchers.map(function (voucher) { return _this.createAnnotatedVoucher(voucher, users, categories, suppliers, equipes); }).sort(function (v1, v2) {
                var d1 = moment(v1.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate();
                var d2 = moment(v2.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate();
                return d1 > d2 ? -1 : 1;
            });
        });
    };
    // basket
    // ======
    //    get basket
    //    ==========
    ProductService.prototype.hasSupplierBasketItems = function (supplier, produits, basketitems) {
        return produits.filter(function (produit) { return produit.supplierId === supplier._id; }).filter(function (produit) { return basketitems.map(function (item) { return item.produit; }).includes(produit._id); }).length > 0;
    };
    ProductService.prototype.getBasketItemsForCurrentUser = function () {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('basket'), this.authService.getUserIdObservable(), function (basket, userId) {
            return basket.filter(function (basketItem) { return basketItem.user === userId; });
        });
    };
    ProductService.prototype.getAnnotatedProductsInBasketBySupplier = function (supplierId) {
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
                        totalPrice: product.price * basketItemFiltered[0].quantity * 1.21,
                        otp: _this.otpChoiceService.determineOtp(product, basketItemFiltered[0].quantity, otps)
                    }
                } : null;
            });
        });
    };
    //     modify basket
    //     =============
    ProductService.prototype.doBasketUpdate = function (productAnnotated, quantity) {
        var q = +quantity && (+quantity) >= 0 ? +quantity : 0;
        if (!productAnnotated.annotation.basketId && q > 0) {
            this.createBasketItem(productAnnotated.data, q);
        }
        if (productAnnotated.annotation.basketId && q === 0) {
            this.removeBasketItem(productAnnotated.annotation.basketId);
        }
        if (productAnnotated.annotation.basketId && q > 0 && q !== productAnnotated.annotation.quantity) {
            this.updateBasketItem(productAnnotated.annotation.basketId, productAnnotated.data, q);
        }
    };
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