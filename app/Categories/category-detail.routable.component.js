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
var router_1 = require('@angular/router');
var product_service_1 = require('../Shared/Services/product.service');
var CategoryDetailComponentRoutable = (function () {
    function CategoryDetailComponentRoutable(productService, route) {
        this.productService = productService;
        this.route = route;
    }
    CategoryDetailComponentRoutable.prototype.initData = function (id) {
        var _this = this;
        if (id) {
            this.categoryObservable = this.productService.getAnnotatedCategoriesById(id);
            this.categoryObservable.subscribe(function (obj) {
                _this.category = obj;
            });
        }
    };
    CategoryDetailComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.initData(id);
        });
    };
    CategoryDetailComponentRoutable = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './category-detail.routable.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService, router_1.ActivatedRoute])
    ], CategoryDetailComponentRoutable);
    return CategoryDetailComponentRoutable;
}());
exports.CategoryDetailComponentRoutable = CategoryDetailComponentRoutable;
//# sourceMappingURL=category-detail.routable.component.js.map