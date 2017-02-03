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
var forms_1 = require('@angular/forms');
var product_service_1 = require('./../../Shared/Services/product.service');
var Rx_1 = require('rxjs/Rx');
var VoucherListComponent = (function () {
    function VoucherListComponent(productService) {
        this.productService = productService;
        this.initialTabInVoucherDetail = '';
        this.path = 'vouchers';
        this.stateChanged = new core_1.EventEmitter();
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    VoucherListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    VoucherListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        //this.vouchersObservable = this.productService.getAnnotatedVouchers();
        Rx_1.Observable.combineLatest(this.vouchersObservable, this.searchControl.valueChanges.startWith(''), function (vouchers, searchTxt) {
            if (searchTxt.trim() === '')
                return vouchers;
            return vouchers.filter(function (otp) { return otp.annotation.user.toUpperCase().includes(searchTxt.toUpperCase()) || otp.annotation.supplier.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (vouchers) {
            _this.vouchers = vouchers;
        });
    };
    VoucherListComponent.prototype.getVoucherObservable = function (id) {
        return this.vouchersObservable.map(function (vouchers) { return vouchers.filter(function (s) { return s.data._id === id; })[0]; });
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    VoucherListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    VoucherListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], VoucherListComponent.prototype, "vouchersObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VoucherListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], VoucherListComponent.prototype, "initialTabInVoucherDetail", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], VoucherListComponent.prototype, "path", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], VoucherListComponent.prototype, "stateChanged", void 0);
    VoucherListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-voucher-list',
            templateUrl: './voucher-list.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], VoucherListComponent);
    return VoucherListComponent;
}());
exports.VoucherListComponent = VoucherListComponent;
//# sourceMappingURL=voucher-list.component.js.map