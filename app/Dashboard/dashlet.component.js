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
var user_service_1 = require('../Shared/Services/user.service');
var order_service_1 = require('../Shared/Services/order.service');
var DashletComponent = (function () {
    function DashletComponent(userService, orderService) {
        this.userService = userService;
        this.orderService = orderService;
    }
    DashletComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.isOtpDashlet()) {
            this.dataObservable = this.orderService.getAnnotatedOtpById(this.id);
        }
        if (this.isEquipeDashlet()) {
            this.dataObservable = this.orderService.getAnnotatedEquipeById(this.id);
        }
        if (this.isOrderDashlet()) {
            this.dataObservable = this.orderService.getAnnotedOrder(this.id);
        }
        this.dataObservable.subscribe(function (x) {
            _this.dataObject = x;
        });
    };
    DashletComponent.prototype.isOtpDashlet = function () {
        return this.userService.isOtpDashlet(this.category);
    };
    DashletComponent.prototype.isEquipeDashlet = function () {
        return this.userService.isEquipeDashlet(this.category);
    };
    DashletComponent.prototype.isOrderDashlet = function () {
        return this.userService.isOrderDashlet(this.category);
    };
    DashletComponent.prototype.getTitle = function () {
        if (this.isOtpDashlet())
            return 'Otp: ' + this.dataObject.data.Name;
        if (this.isEquipeDashlet())
            return 'Equipe: ' + this.dataObject.data.Name;
        if (this.isOrderDashlet())
            return 'Order: ' + this.dataObject.data._id + ' (' + this.dataObject.annotation.supplier + ')';
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], DashletComponent.prototype, "category", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], DashletComponent.prototype, "id", void 0);
    DashletComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-dashlet',
            templateUrl: './dashlet.component.html'
        }), 
        __metadata('design:paramtypes', [user_service_1.UserService, order_service_1.OrderService])
    ], DashletComponent);
    return DashletComponent;
}());
exports.DashletComponent = DashletComponent;
//# sourceMappingURL=dashlet.component.js.map