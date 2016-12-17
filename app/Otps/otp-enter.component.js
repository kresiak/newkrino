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
var data_service_1 = require('./../Shared/Services/data.service');
var OtpEnterComponent = (function () {
    function OtpEnterComponent(dataStore, formBuilder) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
    }
    OtpEnterComponent.prototype.ngOnInit = function () {
        this.otpForm56 = this.formBuilder.group({
            //description89: ['', [Validators.required, Validators.minLength(5)]],
            name: ['', forms_1.Validators.required],
            budget: ['', forms_1.Validators.required],
            description: ['', forms_1.Validators.required],
            datStart: [''],
            datEnd: [''],
            isBlocked: [''],
            isClosed: [''],
            equipedId: ['', forms_1.Validators.required],
            client: ['', forms_1.Validators.required],
            note: ['']
        });
    };
    OtpEnterComponent.prototype.save145 = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('otps', {
            //name: formValue.description89,
            name: formValue.name,
            budget: formValue.budget,
            description: formValue.description,
            datStart: formValue.datStart,
            datEnd: formValue.datEnd,
            isBlocked: formValue.isBlocked,
            isClosed: formValue.isClosed,
            equipedId: formValue.equipeId,
            client: formValue.client,
            note: formValue.note
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    OtpEnterComponent.prototype.reset = function () {
        this.otpForm56.reset();
        this.otpForm56.controls['category'].setValue('-1'); // CHANGER category > otp?
    };
    OtpEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-enter',
            templateUrl: './otp-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder])
    ], OtpEnterComponent);
    return OtpEnterComponent;
}());
exports.OtpEnterComponent = OtpEnterComponent;
//# sourceMappingURL=otp-enter.component.js.map