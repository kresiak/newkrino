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
var selectable_data_1 = require('../../Shared/Classes/selectable-data');
var data_service_1 = require('../../Shared/Services/data.service');
var AdminAK = (function () {
    function AdminAK(dataStore) {
        this.dataStore = dataStore;
        this.stateChanged = new core_1.EventEmitter();
        this.dbCollections = [];
        this.collectionSelected = 'orders';
        this.dbCollections.push(new selectable_data_1.SelectableData('users.krino', 'users.krino'));
        this.dbCollections.push(new selectable_data_1.SelectableData('orders.vouchers', 'orders.vouchers'));
        this.dbCollections.push(new selectable_data_1.SelectableData('orders', 'orders'));
        this.dbCollections.push(new selectable_data_1.SelectableData('otps', 'otps'));
        this.dbCollections.push(new selectable_data_1.SelectableData('suppliers', 'suppliers'));
        this.dbCollections.push(new selectable_data_1.SelectableData('equipes', 'equipes'));
        this.dbCollections.push(new selectable_data_1.SelectableData('products', 'products'));
        this.dbCollections.push(new selectable_data_1.SelectableData('categories', 'categories'));
        this.dbCollections.push(new selectable_data_1.SelectableData('basket', 'basket'));
        this.dbCollections.push(new selectable_data_1.SelectableData('orders.reception', 'orders.reception'));
    }
    AdminAK.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    AdminAK.prototype.ngOnInit = function () {
        this.stateInit();
        this.dbCollectionsObservable = Rx_1.Observable.from([this.dbCollections]);
    };
    AdminAK.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    AdminAK.prototype.dbChanged = function (newid) {
        //this.dataStore.triggerDataNext(newid)
        this.collectionSelected = newid;
    };
    AdminAK.prototype.refresh = function () {
        this.dataStore.triggerDataNext(this.collectionSelected);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AdminAK.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AdminAK.prototype, "stateChanged", void 0);
    AdminAK = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-admin-ak',
            templateUrl: './component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore])
    ], AdminAK);
    return AdminAK;
}());
exports.AdminAK = AdminAK;
//# sourceMappingURL=component.js.map