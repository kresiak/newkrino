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
var Rx_1 = require('rxjs/Rx');
var data_service_1 = require('./../Shared/Services/data.service');
var product_service_1 = require('./../Shared/Services/product.service');
var order_service_1 = require('./../Shared/Services/order.service');
var user_service_1 = require('./../Shared/Services/user.service');
var OtpDetailComponent = (function () {
    function OtpDetailComponent(dataStore, productService, orderService, userService) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.userService = userService;
    }
    OtpDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.otpObservable.map(function (otp) { return otp.data.Categorie; });
        this.otpObservable.subscribe(function (otp) {
            _this.otp = otp;
            _this.ordersObservable = _this.orderService.getAnnotedOrdersByOtp(otp.data._id);
            _this.ordersObservable.subscribe(function (orders) { return _this.anyOrder = orders && orders.length > 0; });
        });
    };
    OtpDetailComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.otp.data.Categorie = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.productService.createCategory(newCategory);
    };
    OtpDetailComponent.prototype.setDashlet = function (isChecked, dashletId) {
        if (isChecked) {
            this.userService.createOtpDashletForCurrentUser(this.otp.data._id);
        }
        else {
            if (dashletId)
                this.userService.removeDashletForCurrentUser(dashletId);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OtpDetailComponent.prototype, "otpObservable", void 0);
    OtpDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-detail',
            templateUrl: './otp-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, user_service_1.UserService])
    ], OtpDetailComponent);
    return OtpDetailComponent;
}());
exports.OtpDetailComponent = OtpDetailComponent;
//# sourceMappingURL=otp-detail.component.js.map