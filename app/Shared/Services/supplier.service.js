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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var data_service_1 = require('./data.service');
var api_service_1 = require('./api.service');
core_1.Injectable();
var SupplierService = (function () {
    function SupplierService(dataStore, apiService) {
        this.dataStore = dataStore;
        this.apiService = apiService;
    }
    SupplierService.prototype.getSupplier = function (supplierId) {
        return this.dataStore.getDataObservable('Suppliers').map(function (suppliers) {
            var x = suppliers.filter(function (supplier) { return supplier._id === supplierId; });
            return x && x.length > 0 ? x[0] : null;
        });
    };
    SupplierService.prototype.passCommand = function (record) {
        var obs = this.apiService.callWebService('passOrder', record).map(function (res) { return res.json(); });
        obs.subscribe(function (res) {
            //this.dataStore.triggerDataNext('basket');
            //this.dataStore.triggerDataNext('orders');
        });
        return obs;
    };
    SupplierService = __decorate([
        __param(0, core_1.Inject(data_service_1.DataStore)),
        __param(1, core_1.Inject(api_service_1.ApiService)), 
        __metadata('design:paramtypes', [data_service_1.DataStore, api_service_1.ApiService])
    ], SupplierService);
    return SupplierService;
}());
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map