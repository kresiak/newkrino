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
var data_service_1 = require('./../Shared/Services/data.service');
var forms_1 = require('@angular/forms');
var supplier_service_1 = require('./../Shared/Services/supplier.service');
var platform_browser_1 = require("@angular/platform-browser");
var ReceptionDetailComponent = (function () {
    function ReceptionDetailComponent(formBuilder, dataStore, supplierService, _sanitizer) {
        var _this = this;
        this.formBuilder = formBuilder;
        this.dataStore = dataStore;
        this.supplierService = supplierService;
        this._sanitizer = _sanitizer;
        this.autocompleListFormatter = function (data) {
            var html = "<span>" + data.value + "</span>";
            return _this._sanitizer.bypassSecurityTrustHtml(html);
        };
    }
    ReceptionDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.receptionForm = this.formBuilder.group({
            supplier: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            reference: ['', forms_1.Validators.required],
            position: ['', forms_1.Validators.required],
            supplierId: ['']
        });
        this.supplierService.getAnnotatedSuppliers().subscribe(function (suppliers) {
            _this.suppliersList = suppliers.map(function (supplier) {
                return {
                    id: supplier.data._id,
                    value: supplier.data.name
                };
            });
        });
        this.supplierService.getAnnotatedReceptions().subscribe(function (receptions) {
            _this.receptionList = receptions;
        });
    };
    ReceptionDetailComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('orders.reception', {
            supplier: formValue.supplier,
            reference: formValue.reference,
            position: formValue.position,
            supplierId: formValue.supplierId.id
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    ReceptionDetailComponent.prototype.reset = function () {
        this.receptionForm.reset();
    };
    ReceptionDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-reception-detail',
            templateUrl: './reception-detail.component.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, data_service_1.DataStore, supplier_service_1.SupplierService, platform_browser_1.DomSanitizer])
    ], ReceptionDetailComponent);
    return ReceptionDetailComponent;
}());
exports.ReceptionDetailComponent = ReceptionDetailComponent;
//# sourceMappingURL=reception-detail.component.js.map