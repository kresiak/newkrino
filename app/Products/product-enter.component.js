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
var product_service_1 = require('../Shared/Services/product.service');
var ProductEnterComponent = (function () {
    function ProductEnterComponent(formBuilder, productService) {
        this.formBuilder = formBuilder;
        this.productService = productService;
    }
    ProductEnterComponent.prototype.isCategoryIdSelected = function (control) {
        if (control.value === '-1') {
            return { "category": true };
        }
        return null;
    };
    ProductEnterComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.productService.getSelectableCategories().subscribe(function (cd) { return _this.categoryData = cd; });
        var priceRegEx = "^\\d+(.\\d*)?$";
        this.productForm = this.formBuilder.group({
            description: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            price: ['', [forms_1.Validators.required, forms_1.Validators.pattern(priceRegEx)]],
            category: ['-1', this.isCategoryIdSelected]
        });
    };
    ProductEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.productService.createProduct({
            Description: formValue.description,
            Supplier: this.supplierId,
            Prix: formValue.price,
            Categorie: [formValue.category]
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    ProductEnterComponent.prototype.reset = function () {
        this.productForm.reset();
        this.productForm.controls['category'].setValue('-1');
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ProductEnterComponent.prototype, "supplierId", void 0);
    ProductEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product-enter',
            templateUrl: './product-enter.component.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, product_service_1.ProductService])
    ], ProductEnterComponent);
    return ProductEnterComponent;
}());
exports.ProductEnterComponent = ProductEnterComponent;
//# sourceMappingURL=product-enter.component.js.map