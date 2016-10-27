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
var selectable_data_1 = require('./../Classes/selectable-data');
var Rx_1 = require('rxjs/Rx');
core_1.Injectable();
var OrderService = (function () {
    function OrderService(dataStore, authService) {
        this.dataStore = dataStore;
        this.authService = authService;
    }
    OrderService.prototype.getSelectableOtps = function () {
        return this.dataStore.getDataObservable('otps').map(function (otps) {
            return otps.map(function (otp) {
                return new selectable_data_1.SelectableData(otp._id, otp.Name);
            });
        });
    };
    OrderService.prototype.updateOrder = function (order) {
        this.dataStore.updateData('orders', order._id, order);
    };
    OrderService.prototype.getAnnotedOrder = function (id) {
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('orders').map(function (orders) { return orders.filter(function (order) { return order._id === id; })[0]; }), this.dataStore.getDataObservable('Produits'), this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('krinousers'), this.dataStore.getDataObservable('equipes'), this.dataStore.getDataObservable('Suppliers'), function (order, products, otps, users, equipes, suppliers) {
            if (!order)
                return null;
            var supplier = suppliers.filter(function (supplier) { return supplier._id === order.supplierId; })[0];
            var equipe = equipes.filter(function (equipe) { return equipe._id === order.equipeId; })[0];
            var user = users.filter(function (user) { return user._id === order.userId; })[0];
            return {
                data: order,
                annotation: {
                    user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                    supplier: supplier ? supplier.Nom : 'Unknown supllier',
                    equipe: equipe ? equipe.Name : 'Unknown equipe',
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
        });
    };
    OrderService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(auth_service_1.AuthService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, auth_service_1.AuthService])
    ], OrderService);
    return OrderService;
}());
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map