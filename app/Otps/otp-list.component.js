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
var OtpListComponent = (function () {
    function OtpListComponent() {
    }
    OtpListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.otpsObservable.subscribe(function (otps) { return _this.otps = otps; });
    };
    OtpListComponent.prototype.getOtpObservable = function (id) {
        return this.otpsObservable.map(function (otps) { return otps.filter(function (otp) { return otp._id === id; })[0]; });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OtpListComponent.prototype, "otpsObservable", void 0);
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