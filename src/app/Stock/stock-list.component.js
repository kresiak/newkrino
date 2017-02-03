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
var product_service_1 = require('./../Shared/Services/product.service');
var Rx_1 = require('rxjs/Rx');
var StockListComponentRoutable = (function () {
    function StockListComponentRoutable(productService) {
        this.productService = productService;
    }
    StockListComponentRoutable.prototype.ngOnInit = function () {
        this.productsObservable = this.productService.getAnnotatedAvailableStockProductsAll();
    };
    StockListComponentRoutable = __decorate([
        core_1.Component({
            template: "<gg-stock-list [productsObservable]= \"productsObservable\"></gg-stock-list>"
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], StockListComponentRoutable);
    return StockListComponentRoutable;
}());
exports.StockListComponentRoutable = StockListComponentRoutable;
var StockListComponent = (function () {
    function StockListComponent() {
        this.stateChanged = new core_1.EventEmitter();
    }
    StockListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    StockListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.productsObservable.subscribe(function (products) {
            return _this.products = products;
        });
    };
    StockListComponent.prototype.getProductObservable = function (id) {
        return this.productsObservable.map(function (products) {
            var product = products.filter(function (s) { return s.key === id; })[0];
            return product;
        });
    };
    StockListComponent.prototype.nbAvailable = function (product) {
        return product.values.reduce(function (acc, b) { return acc + b.annotation.nbAvailable; }, 0);
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    StockListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    StockListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        //: Observable<any>;
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], StockListComponent.prototype, "productsObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], StockListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], StockListComponent.prototype, "stateChanged", void 0);
    StockListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-stock-list',
            templateUrl: './stock-list.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], StockListComponent);
    return StockListComponent;
}());
exports.StockListComponent = StockListComponent;
//# sourceMappingURL=stock-list.component.js.map