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
var supplier_service_1 = require('./../Shared/Services/supplier.service');
var navigation_service_1 = require('../Shared/Services/navigation.service');
var auth_service_1 = require('../Shared/Services/auth.service');
var ProductListComponentRoutable = (function () {
    function ProductListComponentRoutable(productService, supplierService, navigationService, authService) {
        this.productService = productService;
        this.supplierService = supplierService;
        this.navigationService = navigationService;
        this.authService = authService;
    }
    ProductListComponentRoutable.prototype.ngAfterViewInit = function () {
        this.navigationService.jumpToOpenRootAccordionElement();
    };
    ProductListComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoAll();
        this.suppliersObservable = this.supplierService.getAnnotatedSuppliersByFrequence();
        this.authService.getStatusObservable().subscribe(function (statusInfo) {
            _this.authorizationStatusInfo = statusInfo;
            //      this.navigationService.getStateObservable().subscribe(state => {
            //          this.state= state
        });
    };
    ProductListComponentRoutable = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './product-list.routable.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService, supplier_service_1.SupplierService, navigation_service_1.NavigationService, auth_service_1.AuthService])
    ], ProductListComponentRoutable);
    return ProductListComponentRoutable;
}());
exports.ProductListComponentRoutable = ProductListComponentRoutable;
//# sourceMappingURL=product-list.routable.component.js.map