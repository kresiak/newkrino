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
var data_service_1 = require('./../../Shared/Services/data.service');
var order_service_1 = require('../../Shared/Services/order.service');
var VoucherDetailComponent = (function () {
    function VoucherDetailComponent(dataStore, orderService) {
        this.dataStore = dataStore;
        this.orderService = orderService;
        this.isRoot = false;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
    }
    VoucherDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
    };
    VoucherDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.voucherObservable.subscribe(function (eq) {
            _this.voucher = eq;
            if (_this.voucher) {
                _this.otpListObservable = _this.orderService.getAnnotatedOpenOtpsByCategory(_this.voucher.data.categoryId).map(function (otps) { return otps.map(function (otp) {
                    return {
                        id: otp.data._id,
                        name: otp.data.name
                    };
                }); });
            }
        });
    };
    VoucherDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.voucher && comments) {
            this.voucher.data.comments = comments;
            this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
        }
    };
    VoucherDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    VoucherDetailComponent.prototype.sapIdUpdated = function (name) {
        this.voucher.data.sapId = name;
        this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
    };
    VoucherDetailComponent.prototype.otpChanged = function (newid) {
        this.voucher.data.otpId = newid;
        this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
    };
    VoucherDetailComponent.prototype.isInSapUpdated = function (flag) {
        if (this.voucher.data.shopping) {
            this.voucher.data.shopping.isSapUpdated = flag;
            this.dataStore.updateData('orders.vouchers', this.voucher.data._id, this.voucher.data);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], VoucherDetailComponent.prototype, "voucherObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VoucherDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], VoucherDetailComponent.prototype, "path", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], VoucherDetailComponent.prototype, "isRoot", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], VoucherDetailComponent.prototype, "initialTab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], VoucherDetailComponent.prototype, "stateChanged", void 0);
    VoucherDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-voucher-detail',
            templateUrl: './voucher-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, order_service_1.OrderService])
    ], VoucherDetailComponent);
    return VoucherDetailComponent;
}());
exports.VoucherDetailComponent = VoucherDetailComponent;
//# sourceMappingURL=voucher-detail.component.js.map