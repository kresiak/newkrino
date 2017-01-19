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
var product_service_1 = require('../../Shared/Services/product.service');
var AdminWebShoppingVoucherRequestListComponent = (function () {
    function AdminWebShoppingVoucherRequestListComponent(productService) {
        this.productService = productService;
        this.stateChanged = new core_1.EventEmitter();
        this.openPanelId = "";
    }
    AdminWebShoppingVoucherRequestListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    AdminWebShoppingVoucherRequestListComponent.prototype.ngOnInit = function () {
        this.stateInit();
        this.openRequestsObservable = this.productService.getOpenRequestedVouchers();
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    AdminWebShoppingVoucherRequestListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AdminWebShoppingVoucherRequestListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AdminWebShoppingVoucherRequestListComponent.prototype, "stateChanged", void 0);
    AdminWebShoppingVoucherRequestListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-voucher-request-list',
            templateUrl: './voucher-request-list.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], AdminWebShoppingVoucherRequestListComponent);
    return AdminWebShoppingVoucherRequestListComponent;
}());
exports.AdminWebShoppingVoucherRequestListComponent = AdminWebShoppingVoucherRequestListComponent;
//# sourceMappingURL=voucher-request-list.component.js.map