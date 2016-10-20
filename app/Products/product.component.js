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
var data_service_1 = require('./../Shared/Services/data.service');
var selectable_data_1 = require('./../ui/selector/selectable-data');
var ProductComponent = (function () {
    function ProductComponent(dataStore) {
        this.dataStore = dataStore;
        this.selectableDataObservable = this.dataStore.getDataObservable('Categories').map(function (categories) {
            return categories.map(function (category) {
                return new selectable_data_1.SelectableData(category._id, category.Description);
            });
        });
    }
    ProductComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.selectedDataObservable = this.productObservable.map(function (product) { return product.Categorie; });
        this.productObservable.subscribe(function (product) {
            _this.product = product;
        });
    };
    ProductComponent.prototype.descriptionUpdated = function (desc) {
        this.product.Description = desc;
        this.dataStore.updateData('Produits', this.product._id, this.product);
    };
    ProductComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.product.Categorie = selectedIds;
        this.dataStore.updateData('Produits', this.product._id, this.product);
    };
    ProductComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.dataStore.addData('Categories', { 'Description': newCategory });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ProductComponent.prototype, "productObservable", void 0);
    ProductComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product',
            templateUrl: './product.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore])
    ], ProductComponent);
    return ProductComponent;
}());
exports.ProductComponent = ProductComponent;
//# sourceMappingURL=product.component.js.map