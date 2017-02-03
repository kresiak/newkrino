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
var ProductGridComponent = (function () {
    function ProductGridComponent() {
    }
    ProductGridComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.productsObservable.subscribe(function (products) {
            _this.products = products;
        });
    };
    ProductGridComponent.prototype.getProductObservable = function (id) {
        return this.productsObservable.map(function (products) { return products.filter(function (product) { return product.data._id === id; })[0]; });
    };
    ProductGridComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ProductGridComponent.prototype, "productsObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ProductGridComponent.prototype, "config", void 0);
    ProductGridComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product-grid',
            templateUrl: './product-grid.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], ProductGridComponent);
    return ProductGridComponent;
}());
exports.ProductGridComponent = ProductGridComponent;
//# sourceMappingURL=product-grid.component.js.map