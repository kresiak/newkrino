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
var api_service_1 = require('./../Shared/Services/api.service');
var Rx_1 = require('rxjs/Rx');
var SupplierDetailComponent = (function () {
    function SupplierDetailComponent(apiService) {
        this.apiService = apiService;
    }
    SupplierDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        Rx_1.Observable.forkJoin([
            this.apiService.crudGetRecord('Suppliers', this.supplierId), this.apiService.crudGetRecords("Produits")
        ]).subscribe(function (data) {
            _this.supplier = data[0];
            _this.supplier.products = data[1].filter(function (supplier) { return supplier.Supplier === _this.supplierId; });
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SupplierDetailComponent.prototype, "supplierId", void 0);
    SupplierDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-supplier-detail',
            templateUrl: './supplier-detail.component.html'
        }), 
        __metadata('design:paramtypes', [api_service_1.ApiService])
    ], SupplierDetailComponent);
    return SupplierDetailComponent;
}());
exports.SupplierDetailComponent = SupplierDetailComponent;
//# sourceMappingURL=supplier-detail.component.js.map