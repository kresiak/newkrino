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
    }
    // otps
    // ======
    OrderService.prototype.getSelectableOtps = function () {
        return this.dataStore.getDataObservable('otps').map(function (otps) {
            return otps.map(function (otp) {
                return new selectable_data_1.SelectableData(otp._id, otp.Name);
            });
        });
    };
    OrderService.prototype.createAnnotatedOtp = function (otp, orders, equipes, dashlets) {
        if (!otp)
            return null;
        var amountSpent = orders.map(function (order) { return order.items.filter(function (item) { return item.otp === otp._id; }).map(function (item) { return item.total; }).reduce(function (a, b) { return a + b; }, 0); }).reduce(function (a, b) { return a + b; }, 0);
        var equipe = equipes.filter(function (equipe) { return equipe._id === otp.Equipe; })[0];
        var dashlet = dashlets.filter(function (dashlet) { return dashlet.id === otp._id; });
        return {
            data: otp,
            annotation: {
                budget: (+(otp.Budget)),
                amountSpent: amountSpent,
                amountAvailable: (+(otp.Budget)) - amountSpent,
                equipe: equipe ? equipe.Name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        };
    };
    OrderService.prototype.getAnnotatedOtps = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('equipes'), this.dataStore.getDataObservable('orders'), this.userService.getOtpDashletsForCurrentUser(), function (otps, equipes, orders, dashlets) {
            return otps.map(function (otp) { return _this.createAnnotatedOtp(otp, orders, equipes, dashlets); });
        });
    };
    OrderService.prototype.getAnnotatedOtpsByEquipe = function (equipeId) {
        return this.getAnnotatedOtps().map(function (otps) { return otps.filter(function (otp) { return otp.data.Equipe === equipeId; }); });
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
        var supplier = suppliers.filter(function (supplier) { return supplier._id === order.supplierId; })[0];
        var equipe = equipes.filter(function (equipe) { return equipe._id === order.equipeId; })[0];
        var user = users.filter(function (user) { return user._id === order.userId; })[0];
        var dashlet = dashlets.filter(function (dashlet) { return dashlet.id === order._id; });
        return {
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.Nom : 'Unknown supllier',
                equipe: equipe ? equipe.Name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined,
                items: order.items.map(function (item) {
                    var product = products.filter(function (product) { return product._id === item.product; })[0];
                    var otp = otps.filter(function (otp) { return otp._id === item.otp; })[0];
                    return {
                        data: item,
                        annotation: {
                            otp: otp ? otp.Name : 'Unknown otp',
                            description: product ? product.Description : 'Unknown product',
                            price: product ? product.Prix : '0'
                        }
                    };
                })
            }
        };
    };
    // viewing orders
    // ==============
    OrderService.prototype.getAnnotedOrder = function (id) {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order._id === id; })[0]; }), this.dataStore.getDataObservable('Produits'), this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('krinousers'), this.dataStore.getDataObservable('equipes'), this.dataStore.getDataObservable('Suppliers'), this.userService.getOrderDashletsForCurrentUser(), function (order, products, otps, users, equipes, suppliers, dashlets) {
            return _this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
        });
    };
    OrderService.prototype.getAnnotedOrders = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('orders'), this.dataStore.getDataObservable('Produits'), this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('krinousers'), this.dataStore.getDataObservable('equipes'), this.dataStore.getDataObservable('Suppliers'), this.userService.getOrderDashletsForCurrentUser(), function (orders, products, otps, users, equipes, suppliers, dashlets) {
            return orders.map(function (order) {
                return _this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
            });
        });
    };
    OrderService.prototype.getAnnotedOrdersBySupplier = function (supplierId) {
        return this.getAnnotedOrders().map(function (orders) { return orders.filter(function (order) { return order.data.supplierId === supplierId; }); });
    };
    OrderService.prototype.getAnnotedOrdersByEquipe = function (equipeId) {
        return this.getAnnotedOrders().map(function (orders) { return orders.filter(function (order) { return order.data.equipeId === equipeId; }); });
    };
    OrderService.prototype.getAnnotedOrdersOfCurrentUser = function () {
        return Rx_1.Observable.combineLatest(this.getAnnotedOrders(), this.authService.getUserIdObservable(), function (orders, userId) {
            return orders.filter(function (order) { return order.data.userId === userId; });
        });
    };
    OrderService.prototype.getAnnotedOrdersByOtp = function (otpId) {
        return this.getAnnotedOrders().map(function (orders) { return orders.filter(function (order) { return order.data.items.map(function (item) { return item.otp; }).includes(otpId); }); });
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
        var otpsFiltered = otps.filter(function (otp) { return otp.Equipe === equipe._id; });
        var budget = otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(function (otp) { return +otp.Budget; }).reduce(function (a, b) { return a + b; }) : 0;
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