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
var product_service_1 = require('./../Shared/Services/product.service');
var ProductComponent = (function () {
    function ProductComponent(productService) {
        this.productService = productService;
    }
    ProductComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(function (product) { return product.data.categoryIds; });
        this.selectableManipsObservable = this.productService.getSelectableManips();
        this.selectedManipIdsObservable = this.productObservable.map(function (product) { return product.data.manipIds; });
        this.productObservable.subscribe(function (product) {
            _this.product = product;
        });
    };
    ProductComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    // =======================
    // Feedback from controls
    // =======================
    ProductComponent.prototype.descriptionUpdated = function (desc) {
        if (this.product.data.name !== desc) {
            this.product.data.name = desc;
            this.productService.updateProduct(this.product.data);
        }
    };
    ProductComponent.prototype.prixUpdated = function (prix) {
        var p = +prix && (+prix) >= 0 ? +prix : -1;
        if (p !== -1) {
            if (this.product.price !== p) {
                this.product.data.price = p;
                this.productService.updateProduct(this.product.data);
            }
        }
        else {
            this.priceChild.resetContent(this.product.data.price);
        }
    };
    ProductComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.product.data.categoryIds = selectedIds;
        this.productService.updateProduct(this.product.data);
    };
    ProductComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.productService.createCategory(newCategory);
    };
    ProductComponent.prototype.manipSelectionChanged = function (selectedIds) {
        this.product.data.manipIds = selectedIds;
        this.productService.updateProduct(this.product.data);
    };
    ProductComponent.prototype.quantityBasketUpdated = function (quantity) {
        this.productService.doBasketUpdate(this.product, quantity);
    };
    __decorate([
        core_1.ViewChild('prix'), 
        __metadata('design:type', Object)
    ], ProductComponent.prototype, "priceChild", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ProductComponent.prototype, "productObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ProductComponent.prototype, "config", void 0);
    ProductComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product',
            templateUrl: './product.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], ProductComponent);
    return ProductComponent;
}());
exports.ProductComponent = ProductComponent;
//# sourceMappingURL=product.component.js.map