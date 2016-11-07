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
var Rx_1 = require('rxjs/Rx');
var auth_service_1 = require('./../Shared/Services/auth.service');
var data_service_1 = require('./../Shared/Services/data.service');
var StockDetailComponent = (function () {
    function StockDetailComponent(authService, dataStore) {
        this.authService = authService;
        this.dataStore = dataStore;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
    }
    StockDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
    };
    StockDetailComponent.prototype.formStockInit = function (product) {
        var _this = this;
        this.frmStockOrder = new forms_1.FormGroup({});
        product.values.forEach(function (prod) {
            _this.frmStockOrder.addControl(prod.data._id, new forms_1.FormControl('0'));
        });
    };
    StockDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.productObservable.subscribe(function (product) {
            _this.product = product;
            _this.formStockInit(product);
        });
    };
    StockDetailComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        var userId = this.authService.getUserId();
        var equipeId = this.authService.getEquipeId();
        var now = new Date();
        this.product.values.forEach(function (stockItem) {
            if (formValue[stockItem.data._id] && +formValue[stockItem.data._id] > 0) {
                if (!stockItem.data.sales)
                    stockItem.data.sales = [];
                stockItem.data.sales.push({
                    quantity: +formValue[stockItem.data._id],
                    userId: userId,
                    equipeId: equipeId,
                    date: now
                });
                _this.dataStore.updateData('productsStock', stockItem.data._id, stockItem.data);
            }
        });
    };
    StockDetailComponent.prototype.reset = function () {
        this.formStockInit(this.product);
    };
    StockDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    StockDetailComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], StockDetailComponent.prototype, "productObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], StockDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], StockDetailComponent.prototype, "initialTab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], StockDetailComponent.prototype, "stateChanged", void 0);
    StockDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-stock-detail',
            templateUrl: './stock-detail.component.html'
        }), 
        __metadata('design:paramtypes', [auth_service_1.AuthService, data_service_1.DataStore])
    ], StockDetailComponent);
    return StockDetailComponent;
}());
exports.StockDetailComponent = StockDetailComponent;
//# sourceMappingURL=stock-detail.component.js.map