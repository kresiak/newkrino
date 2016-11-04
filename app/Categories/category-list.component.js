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
var CategoryListComponent = (function () {
    function CategoryListComponent(productService) {
        this.productService = productService;
        this.openPanelId = "";
    }
    CategoryListComponent.prototype.ngOnInit = function () {
        this.categories = this.productService.getAnnotatedCategories();
        this.categories.subscribe(function (category) {
            var x = category;
        });
    };
    CategoryListComponent.prototype.getCategoryObservable = function (id) {
        return this.categories.map(function (categories) { return categories.filter(function (s) { return s.data._id === id; })[0]; });
    };
    CategoryListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState)
            this.openPanelId = $event.panelId;
    };
    ;
    CategoryListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './category-list.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], CategoryListComponent);
    return CategoryListComponent;
}());
exports.CategoryListComponent = CategoryListComponent;
//# sourceMappingURL=category-list.component.js.map