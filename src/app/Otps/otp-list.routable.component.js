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
var order_service_1 = require('./../Shared/Services/order.service');
var navigation_service_1 = require('../Shared/Services/navigation.service');
var auth_service_1 = require('../Shared/Services/auth.service');
var OtpListComponentRoutable = (function () {
    function OtpListComponentRoutable(orderService, navigationService, authService) {
        this.orderService = orderService;
        this.navigationService = navigationService;
        this.authService = authService;
    }
    OtpListComponentRoutable.prototype.ngAfterViewInit = function () {
        this.navigationService.jumpToOpenRootAccordionElement();
    };
    OtpListComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.navigationService.getStateObservable().subscribe(function (state) {
            _this.state = state;
        });
        this.otpsObservable = this.orderService.getAnnotatedOtps();
        this.authService.getStatusObservable().subscribe(function (statusInfo) {
            _this.authorizationStatusInfo = statusInfo;
        });
    };
    OtpListComponentRoutable = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './otp-list.routable.component.html'
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, navigation_service_1.NavigationService, auth_service_1.AuthService])
    ], OtpListComponentRoutable);
    return OtpListComponentRoutable;
}());
exports.OtpListComponentRoutable = OtpListComponentRoutable;
//# sourceMappingURL=otp-list.routable.component.js.map