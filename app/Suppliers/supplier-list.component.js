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
var supplier_service_1 = require('./../Shared/Services/supplier.service');
var SupplierListComponent = (function () {
    function SupplierListComponent(dataStore, supplierService) {
        this.dataStore = dataStore;
        this.supplierService = supplierService;
    }
    SupplierListComponent.prototype.ngOnInit = function () {
        this.suppliers = this.supplierService.getAnnotatedSuppliers();
        //this.dataStore.getDataObservable('Suppliers');
    };
    SupplierListComponent.prototype.getSupplierObservable = function (id) {
        return this.suppliers.map(function (suppliers) { return suppliers.filter(function (s) { return s.data._id === id; })[0].data; });
    };
    SupplierListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './supplier-list.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, supplier_service_1.SupplierService])
    ], SupplierListComponent);
    return SupplierListComponent;
}());
exports.SupplierListComponent = SupplierListComponent;
//# sourceMappingURL=supplier-list.component.js.map