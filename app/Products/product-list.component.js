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
var order_service_1 = require('./../Shared/Services/order.service');
var ProductListComponentRoutable = (function () {
    function ProductListComponentRoutable(orderService) {
        this.orderService = orderService;
    }
    ProductListComponentRoutable.prototype.ngOnInit = function () {
        this.productsObservable = this.orderService.getAnnotatedProducts();
    };
    ProductListComponentRoutable = __decorate([
        core_1.Component({
            template: "<gg-product-list [productsObservable]= \"productsObservable\"></gg-product-list>"
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService])
    ], ProductListComponentRoutable);
    return ProductListComponentRoutable;
}());
exports.ProductListComponentRoutable = ProductListComponentRoutable;
var ProductListComponent = (function () {
    function ProductListComponent() {
        this.stateChanged = new core_1.EventEmitter();
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    ProductListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    ProductListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        Rx_1.Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.startWith(''), function (products, searchTxt) {
            if (searchTxt.trim() === '')
                return products;
            return products.filter(function (product) { return product.data.name.toUpperCase().includes(searchTxt.toUpperCase())
                || product.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (products) { return _this.products = products; });
    };
    ProductListComponent.prototype.getProductObservable = function (id) {
        return this.productsObservable.map(function (products) { return products.filter(function (product) { return product.data._id === id; })[0]; });
    };
    ProductListComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    ProductListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    ProductListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ProductListComponent.prototype, "productsObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ProductListComponent.prototype, "config", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ProductListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ProductListComponent.prototype, "stateChanged", void 0);
    ProductListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-product-list',
            templateUrl: './product-list.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], ProductListComponent);
    return ProductListComponent;
}());
exports.ProductListComponent = ProductListComponent;
//# sourceMappingURL=product-list.component.js.map