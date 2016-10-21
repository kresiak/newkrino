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
var Rx_1 = require("rxjs/Rx");
var api_service_1 = require('./api.service');
var DataObservables = (function () {
    function DataObservables(apiService) {
        this.apiService = apiService;
    }
    DataObservables.prototype.triggerNext = function (table) {
        var _this = this;
        if (this[table]) {
            this.apiService.crudGetRecords(table).subscribe(function (res) {
                _this[table].next(res);
            }, function (err) { return console.log("Error retrieving Todos"); });
        }
        else {
            console.log('DataObservables triggerNext ERROR');
        }
    };
    DataObservables.prototype.getObservable = function (table) {
        if (!this[table]) {
            this[table] = new Rx_1.BehaviorSubject([]);
            this.triggerNext(table);
        }
        return this[table];
    };
    DataObservables = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [api_service_1.ApiService])
    ], DataObservables);
    return DataObservables;
}());
exports.DataObservables = DataObservables;
var DataStore = (function () {
    function DataStore(apiService, dataObservables) {
        this.apiService = apiService;
        this.dataObservables = dataObservables;
    }
    DataStore.prototype.getDataObservable = function (table) {
        return this.dataObservables.getObservable(table);
    };
    DataStore.prototype.addData = function (table, newRecord) {
        var _this = this;
        var obs = this.apiService.crudCreateRecord(table, newRecord);
        obs.subscribe(function (res) { return _this.dataObservables.triggerNext(table); });
        return obs;
    };
    ;
    DataStore.prototype.deleteData = function (table, id) {
        var _this = this;
        var obs = this.apiService.crudDeleteRecord(table, id);
        obs.subscribe(function (res) {
            return _this.dataObservables.triggerNext(table);
        });
        return obs;
    };
    DataStore.prototype.updateData = function (table, id, newRecord) {
        var _this = this;
        var obs = this.apiService.crudUpdateRecord(table, id, newRecord);
        obs.subscribe(function (res) {
            _this.dataObservables.triggerNext(table);
        });
        return obs;
    };
    DataStore = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [api_service_1.ApiService, DataObservables])
    ], DataStore);
    return DataStore;
}());
exports.DataStore = DataStore;
//# sourceMappingURL=data.service.js.map