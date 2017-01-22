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
var platform_browser_1 = require("@angular/platform-browser");
var order_service_1 = require('../../Shared/Services/order.service');
var product_service_1 = require('../../Shared/Services/product.service');
var data_service_1 = require('./../../Shared/Services/data.service');
var AdminWebShoppingVoucherRequestComponent = (function () {
    function AdminWebShoppingVoucherRequestComponent(dataStore, formBuilder, orderService, productService, _sanitizer) {
        var _this = this;
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
        this.orderService = orderService;
        this.productService = productService;
        this._sanitizer = _sanitizer;
        this.autocompleListFormatter = function (data) {
            var html = "<span>" + data.value + "</span>";
            return _this._sanitizer.bypassSecurityTrustHtml(html);
        };
    }
    AdminWebShoppingVoucherRequestComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.voucherForm = this.formBuilder.group({
            sapId: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            otp: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]]
        });
        this.orderService.getAnnotatedOpenOtpsByCategory(this.openRequest.categoryId).subscribe(function (otps) {
            _this.otpList = otps.map(function (otp) {
                return {
                    id: otp.data._id,
                    value: otp.data.name
                };
            });
        });
    };
    AdminWebShoppingVoucherRequestComponent.prototype.save = function (formValue, isValid) {
        var data = {
            userId: this.openRequest.userId,
            supplierId: this.openRequest.supplierId,
            categoryId: this.openRequest.categoryId,
            sapId: formValue.sapId,
            otpId: formValue.otp.id
        };
        this.productService.createVoucher(data).subscribe(function (res) {
            var x = res;
        });
        /*      this.dataStore.addData('', {
              }).subscribe(res => {
                  var x = res;
                  this.reset();
              });*/
    };
    AdminWebShoppingVoucherRequestComponent.prototype.reset = function () {
        this.voucherForm.reset();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AdminWebShoppingVoucherRequestComponent.prototype, "openRequest", void 0);
    AdminWebShoppingVoucherRequestComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-voucher-request',
            templateUrl: './voucher-request.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder, order_service_1.OrderService, product_service_1.ProductService, platform_browser_1.DomSanitizer])
    ], AdminWebShoppingVoucherRequestComponent);
    return AdminWebShoppingVoucherRequestComponent;
}());
exports.AdminWebShoppingVoucherRequestComponent = AdminWebShoppingVoucherRequestComponent;
//# sourceMappingURL=voucher-request.component.js.map