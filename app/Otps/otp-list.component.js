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
var Rx_1 = require('rxjs/Rx');
var order_service_1 = require('./../Shared/Services/order.service');
var OtpListComponentRoutable = (function () {
    function OtpListComponentRoutable(orderService) {
        this.orderService = orderService;
    }
    OtpListComponentRoutable.prototype.ngOnInit = function () {
        this.otpsObservable = this.orderService.getAnnotatedOtps();
    };
    OtpListComponentRoutable = __decorate([
        core_1.Component({
            template: "<gg-otp-list [otpsObservable]= \"otpsObservable\"></gg-otp-list>"
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService])
    ], OtpListComponentRoutable);
    return OtpListComponentRoutable;
}());
exports.OtpListComponentRoutable = OtpListComponentRoutable;
var OtpListComponent = (function () {
    function OtpListComponent() {
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    OtpListComponent.prototype.ngOnInit = function () {
        var _this = this;
        Rx_1.Observable.combineLatest(this.otpsObservable, this.searchControl.valueChanges.startWith(''), function (otps, searchTxt) {
            if (searchTxt.trim() === '')
                return otps;
            return otps.filter(function (otp) { return otp.data.Name.toUpperCase().includes(searchTxt.toUpperCase())
                || otp.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (otps) { return _this.otps = otps; });
        ;
    };
    OtpListComponent.prototype.getOtpObservable = function (id) {
        return this.otpsObservable.map(function (otps) { return otps.filter(function (otp) { return otp.data._id === id; })[0]; });
    };
    OtpListComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OtpListComponent.prototype, "otpsObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OtpListComponent.prototype, "config", void 0);
    OtpListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-list',
            templateUrl: './otp-list.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], OtpListComponent);
    return OtpListComponent;
}());
exports.OtpListComponent = OtpListComponent;
//# sourceMappingURL=otp-list.component.js.map