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
var data_service_1 = require('./../Shared/Services/data.service');
var order_service_1 = require('./../Shared/Services/order.service');
var Rx_1 = require('rxjs/Rx');
var EquipeDetailComponent = (function () {
    function EquipeDetailComponent(dataStore, orderService) {
        this.dataStore = dataStore;
        this.orderService = orderService;
    }
    EquipeDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.equipeObservable.subscribe(function (eq) {
            _this.equipe = eq;
            _this.usersObservable = _this.dataStore.getDataObservable('krinousers').map(function (users) { return users.filter(function (user) { return _this.equipe.Users.includes(user._id); }); });
            _this.otpsObservable = _this.dataStore.getDataObservable('otps').map(function (otps) { return otps.filter(function (otp) { return otp.Equipe === _this.equipe._id; }); });
            _this.ordersObservable = _this.orderService.getAnnotedOrdersByEquipe(eq._id);
            _this.ordersObservable.subscribe(function (orders) { return _this.anyOrder = orders && orders.length > 0; });
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], EquipeDetailComponent.prototype, "equipeObservable", void 0);
    EquipeDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-detail',
            templateUrl: './equipe-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, order_service_1.OrderService])
    ], EquipeDetailComponent);
    return EquipeDetailComponent;
}());
exports.EquipeDetailComponent = EquipeDetailComponent;
//# sourceMappingURL=equipe-detail.component.js.map