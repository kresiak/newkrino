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
var product_service_1 = require('../Shared/Services/product.service');
var moment = require("moment");
var OtpEnterComponent = (function () {
    function OtpEnterComponent(dataStore, formBuilder, productService) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
        this.productService = productService;
    }
    OtpEnterComponent.prototype.ngOnInit = function () {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        var md = moment();
        this.otpForm = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            budget: ['', forms_1.Validators.required],
            description: ['', forms_1.Validators.required],
            isBlocked: [''],
            isClosed: [''],
            client: [''],
            note: ['']
        });
    };
    OtpEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('otps', {
            name: formValue.name,
            budget: formValue.budget,
            description: formValue.description,
            datStart: this.datStart,
            datEnd: this.datEnd,
            isBlocked: formValue.isBlocked,
            isClosed: formValue.isClosed,
            equipeId: this.equipeId,
            client: formValue.client,
            note: formValue.note,
            categoryIds: this.selectedIds
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    OtpEnterComponent.prototype.reset = function () {
        this.otpForm.reset();
        this.categoriesChild.emptyContent();
        this.datStartChild.emptyContent();
        this.datEndChild.emptyContent();
    };
    OtpEnterComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.selectedIds = selectedIds;
    };
    OtpEnterComponent.prototype.dateUpdatedStart = function (date) {
        this.datStart = date;
    };
    OtpEnterComponent.prototype.dateUpdatedEnd = function (date) {
        this.datEnd = date;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], OtpEnterComponent.prototype, "equipeId", void 0);
    __decorate([
        core_1.ViewChild('categoriesSelector'), 
        __metadata('design:type', Object)
    ], OtpEnterComponent.prototype, "categoriesChild", void 0);
    __decorate([
        core_1.ViewChild('datStart'), 
        __metadata('design:type', Object)
    ], OtpEnterComponent.prototype, "datStartChild", void 0);
    __decorate([
        core_1.ViewChild('datEnd'), 
        __metadata('design:type', Object)
    ], OtpEnterComponent.prototype, "datEndChild", void 0);
    OtpEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-enter',
            templateUrl: './otp-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder, product_service_1.ProductService])
    ], OtpEnterComponent);
    return OtpEnterComponent;
}());
exports.OtpEnterComponent = OtpEnterComponent;
//# sourceMappingURL=otp-enter.component.js.map