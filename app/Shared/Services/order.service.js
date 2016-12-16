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
var user_service_1 = require('./user.service');
var selectable_data_1 = require('./../Classes/selectable-data');
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var OrderService = (function () {
    function OrderService(dataStore, authService, userService) {
        this.dataStore = dataStore;
        this.authService = authService;
        this.userService = userService;
        // viewing orders
        // ==============
        this.hashMapFactory = function (list) {
            return list.reduce(function (map, p) {
                map.set(p._id, p);
                return map;
            }, new Map());
        };
    }
    // otps
    // ======
    OrderService.prototype.getSelectableOtps = function () {
        return this.dataStore.getDataObservable('otps').map(function (otps) {
            return otps.map(function (otp) {
                return new selectable_data_1.SelectableData(otp._id, otp.name);
            });
        });
    };
    OrderService.prototype.getOtpMoneySpentMapObservable = function () {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.reduce(function (map, order) {
            if (order.items) {
                order.items.filter(function (item) { return item.otpId && item.total; }).forEach(function (item) {
                    var otpId = item.otpId;
                    if (!map.has(otpId))
                        map.set(otpId, 0);
                    map.set(otpId, map.get(otpId) + item.total);
                });
            }
            return map;
        }, new Map()); });
    };
    OrderService.prototype.createAnnotatedOtp = function (otp, otpSpentMap, equipes, dashlets) {
        if (!otp)
            return null;
        var amountSpent = otpSpentMap.has(otp._id) ? otpSpentMap.get(otp._id) : 0;
        //orders.map(order => !order.items ? 0 : order.items.filter(item => item.otpId === otp._id).map(item => item.total).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
        var equipe = equipes.filter(function (equipe) { return equipe._id === otp.equipeId; })[0];
        var dashlet = dashlets.filter(function (dashlet) { return dashlet.id === otp._id; });
        return {
            data: otp,
            annotation: {
                budget: (+(otp.budget)),
                amountSpent: amountSpent,
                amountAvailable: (+(otp.budget)) - amountSpent,
                equipe: equipe ? equipe.name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        };
    };
    OrderService.prototype.getAnnotatedOtps = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('equipes'), this.getOtpMoneySpentMapObservable(), this.userService.getOtpDashletsForCurrentUser(), function (otps, equipes, otpSpentMap, dashlets) {
            return otps.map(function (otp) { return _this.createAnnotatedOtp(otp, otpSpentMap, equipes, dashlets); });
        });
    };
    OrderService.prototype.getAnnotatedOtpsByEquipe = function (equipeId) {
        return this.getAnnotatedOtps().map(function (otps) { return otps.filter(function (otp) { return otp.data.equipeId === equipeId; }); });
    };
    OrderService.prototype.getAnnotatedOpenOtpsByCategory = function (categoryId) {
        return this.getAnnotatedOtps().map(function (otps) { return otps.filter(function (otp) { return !otp.data.isBlocked && !otp.data.isClosed && otp.data.categoryIds && otp.data.categoryIds.includes(categoryId); }); });
    };
    OrderService.prototype.getAnnotatedOtpById = function (otpId) {
        return this.getAnnotatedOtps().map(function (otps) {
            var otpFiltered = otps.filter(function (otp) { return otp.data._id === otpId; });
            return otpFiltered.length === 0 ? null : otpFiltered[0];
        });
    };
    // orders
    // ======
    // order helper functions for viewing orders
    // =========================================
    OrderService.prototype.getProductFrequenceMapObservable = function () {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.reduce(function (map, order) {
            if (order.items) {
                order.items.filter(function (item) { return item.productId && item.quantity; }).forEach(function (item) {
                    var productId = item.productId;
                    if (!map.has(productId))
                        map.set(productId, 0);
                    map.set(productId, map.get(productId) + 1);
                });
            }
            return map;
        }, new Map()); });
    };
    OrderService.prototype.getSupplierFrequenceMapObservable = function () {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.reduce(function (map, order) {
            var supplierId = order.supplierId;
            if (supplierId) {
                if (!map.has(supplierId))
                    map.set(supplierId, 0);
                map.set(supplierId, map.get(supplierId) + 1);
            }
            return map;
        }, new Map()); });
    };
    OrderService.prototype.getTotalOfOrder = function (order) {
        return order.items && order.items.length > 0 ? order.items.map(function (item) { return item.total; }).reduce(function (a, b) { return a + b; }) : 0;
    };
    OrderService.prototype.getTotalOfOrders = function (orders) {
        var _this = this;
        return orders.length === 0 ? 0 : orders.map(function (order) { return _this.getTotalOfOrder(order); }).reduce(function (a, b) { return a + b; });
    };
    OrderService.prototype.createAnnotedOrder = function (order, products, otps, users, equipes, suppliers, dashlets) {
        if (!order)
            return null;
        var supplier = suppliers.get(order.supplierId);
        var equipe = equipes.get(order.equipeId);
        var user = users.get(order.userId);
        var dashlet = dashlets.filter(function (dashlet) { return dashlet.id === order._id; });
        return {
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.name : 'Unknown supllier',
                equipe: equipe ? equipe.name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined,
                items: !order.items ? [] : order.items.map(function (item) {
                    var product = products.get(item.productId);
                    var otp = otps.get(item.otpId);
                    return {
                        data: item,
                        annotation: {
                            otp: otp ? otp.name : 'Unknown otp',
                            description: product ? product.name : 'Unknown product',
                            price: product ? product.price : '0',
                            nbDelivered: (item.deliveries || []).reduce(function (acc, delivery) { return acc + (+delivery.quantity); }, 0),
                            deliveries: (item.deliveries || []).map(function (delivery) {
                                return {
                                    data: delivery
                                };
                            })
                        }
                    };
                })
            }
        };
    };
    OrderService.prototype.getAnnotedOrder = function (id) {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order._id === id; })[0]; }), this.dataStore.getDataObservable('products').map(this.hashMapFactory), this.dataStore.getDataObservable('otps').map(this.hashMapFactory), this.dataStore.getDataObservable('users.krino').map(this.hashMapFactory), this.dataStore.getDataObservable('equipes').map(this.hashMapFactory), this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory), this.userService.getOrderDashletsForCurrentUser(), function (order, products, otps, users, equipes, suppliers, dashlets) {
            return _this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
        });
    };
    OrderService.prototype.getAnnotedOrders = function (ordersObservable) {
        var _this = this;
        return Rx_1.Observable.combineLatest(ordersObservable, this.dataStore.getDataObservable('products').map(this.hashMapFactory), this.dataStore.getDataObservable('otps').map(this.hashMapFactory), this.dataStore.getDataObservable('users.krino').map(this.hashMapFactory), this.dataStore.getDataObservable('equipes').map(this.hashMapFactory), this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory), this.userService.getOrderDashletsForCurrentUser(), function (orders, products, otps, users, equipes, suppliers, dashlets) {
            return orders.map(function (order) {
                return _this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
            });
        });
    };
    OrderService.prototype.getAnnotedOrdersFromAll = function () {
        return this.getAnnotedOrders(this.dataStore.getDataObservable('orders'));
    };
    OrderService.prototype.getNewestAnnotedOrders = function (nb) {
        var ordersObservable = this.dataStore.getDataObservable('orders').map(function (orders) { return orders.sort(function (a, b) { return b.kid - a.kid; }).slice(0, nb); });
        return this.getAnnotedOrders(ordersObservable);
    };
    OrderService.prototype.getAnnotedOrdersBySupplier = function (supplierId) {
        var ordersObservable = this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.supplierId === supplierId; }); }).map(function (orders) { return orders.sort(function (a, b) { return b.kid - a.kid; }); });
        return this.getAnnotedOrders(ordersObservable);
    };
    OrderService.prototype.getAnnotedOrdersByProduct = function (productId) {
        var ordersObservable = this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.items && order.items.map(function (item) { return item.productId; }).includes(productId); }); }).map(function (orders) { return orders.sort(function (a, b) { return b.kid - a.kid; }); });
        return this.getAnnotedOrders(ordersObservable);
    };
    OrderService.prototype.hasSupplierAnyOrder = function (supplierId) {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.supplierId === supplierId; }).length > 0; });
    };
    OrderService.prototype.getAnnotedOrdersByEquipe = function (equipeId) {
        var ordersObservable = this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.equipeId === equipeId; }); });
        return this.getAnnotedOrders(ordersObservable);
    };
    OrderService.prototype.hasEquipeAnyOrder = function (equipeId) {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.equipeId === equipeId; }).length > 0; });
    };
    OrderService.prototype.getAnnotedOrdersOfCurrentUser = function () {
        var _this = this;
        return this.authService.getUserIdObservable().switchMap(function (userId) {
            var ordersObservable = _this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.userId === userId; }); });
            return _this.getAnnotedOrders(ordersObservable);
        });
    };
    OrderService.prototype.getAnnotedOrdersByOtp = function (otpId) {
        var ordersObservable = this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.items && order.items.map(function (item) { return item.otpId; }).includes(otpId); }); });
        return this.getAnnotedOrders(ordersObservable);
    };
    OrderService.prototype.hasOtpAnyOrder = function (otpId) {
        return this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order.items && order.items.map(function (item) { return item.otpId; }).includes(otpId); }).length > 0; });
    };
    // updating orders
    // ==============
    OrderService.prototype.updateOrder = function (order) {
        this.dataStore.updateData('orders', order._id, order);
    };
    // equipes
    // =======
    OrderService.prototype.createAnnotatedEquipe = function (equipe, orders, otps, dashlets) {
        if (!equipe)
            return null;
        var ordersFiltered = orders.filter(function (order) { return order.equipeId === equipe._id; });
        var otpsFiltered = otps.filter(function (otp) { return otp.equipeId === equipe._id; });
        var budget = otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(function (otp) { return +otp.budget; }).reduce(function (a, b) { return a + b; }) : 0;
        var amountSpent = this.getTotalOfOrders(ordersFiltered);
        var dashlet = dashlets.filter(function (dashlet) { return dashlet.id === equipe._id; });
        return {
            data: equipe,
            annotation: {
                amountSpent: amountSpent,
                budget: budget,
                amountAvailable: budget - amountSpent,
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        };
    };
    OrderService.prototype.getAnnotatedEquipes = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('equipes'), this.dataStore.getDataObservable('orders'), this.dataStore.getDataObservable('otps'), this.userService.getEquipeDashletsForCurrentUser(), function (equipes, orders, otps, dashlets) {
            return equipes.map(function (equipe) { return _this.createAnnotatedEquipe(equipe, orders, otps, dashlets); });
        });
    };
    OrderService.prototype.getAnnotatedEquipeById = function (equipeId) {
        return this.getAnnotatedEquipes().map(function (equipes) {
            var equipesFiltered = equipes.filter(function (equipe) { return equipe.data._id === equipeId; });
            return equipesFiltered.length === 0 ? null : equipesFiltered[0];
        });
    };
    OrderService.prototype.getAnnotatedEquipesOfCurrentUser = function () {
        return Rx_1.Observable.combineLatest(this.getAnnotatedEquipes(), this.authService.getUserIdObservable(), function (equipes, userId) {
            return equipes.filter(function (equipe) {
                return equipe.data.userIds && equipe.data.userIds.includes(userId);
            });
        });
    };
    OrderService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(auth_service_1.AuthService)),
        __param(2, core_1.Inject(user_service_1.UserService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, auth_service_1.AuthService, user_service_1.UserService])
    ], OrderService);
    return OrderService;
}());
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map