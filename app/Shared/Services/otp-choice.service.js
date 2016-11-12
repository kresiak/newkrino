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
var order_service_1 = require('./order.service');
core_1.Injectable();
var OtpChoiceService = (function () {
    function OtpChoiceService(dataStore, authService, orderService) {
        this.dataStore = dataStore;
        this.authService = authService;
        this.orderService = orderService;
    }
    OtpChoiceService.prototype.determineOtp = function (product, quantity, annotatedOtps) {
        var equipeId = this.authService.getEquipeId();
        var totalPrice = +product.price * quantity * 1.21;
        var possibleOtps = !annotatedOtps ? [] :
            annotatedOtps.filter(function (otp) { return otp.annotation.amountAvailable > totalPrice; }).filter(function (otp) {
                var productCategories = product.categoryIds ? product.categoryIds : [];
                var allowedCategories = otp.data.categoryIds ? otp.data.categoryIds : [];
                return allowedCategories.filter(function (otpCategory) { return productCategories.includes(otpCategory); }).length > 0;
            });
        return possibleOtps.length > 0 ? {
            _id: possibleOtps[0].data._id,
            Name: possibleOtps[0].data.Name } : {
            _id: undefined,
            Name: 'no available Otp'
        };
    };
    OtpChoiceService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(auth_service_1.AuthService)),
        __param(2, core_1.Inject(order_service_1.OrderService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, auth_service_1.AuthService, order_service_1.OrderService])
    ], OtpChoiceService);
    return OtpChoiceService;
}());
exports.OtpChoiceService = OtpChoiceService;
//# sourceMappingURL=otp-choice.service.js.map