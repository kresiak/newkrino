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
var product_service_1 = require('./../Shared/Services/product.service');
var Rx_1 = require('rxjs/Rx');
var CategoryListComponent = (function () {
    function CategoryListComponent(productService) {
        this.productService = productService;
        this.openPanelId = "";
        this.path = 'categories';
        this.stateChanged = new core_1.EventEmitter();
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    CategoryListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    CategoryListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.categoryObservable = this.productService.getAnnotatedCategories();
        Rx_1.Observable.combineLatest(this.categoryObservable, this.searchControl.valueChanges.startWith(''), function (categories, searchTxt) {
            if (searchTxt.trim() === '')
                return categories;
            return categories.filter(function (category) { return category.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || category.data.name.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (categories) { return _this.categories = categories; });
    };
    CategoryListComponent.prototype.getCategoryObservable = function (id) {
        return this.categoryObservable.map(function (categories) { return categories.filter(function (s) {
            return s.data._id === id;
        })[0]; });
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    CategoryListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    CategoryListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CategoryListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], CategoryListComponent.prototype, "path", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], CategoryListComponent.prototype, "stateChanged", void 0);
    CategoryListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-category-list',
            templateUrl: './category-list.component.html'
        }), 
        __metadata('design:paramtypes', [product_service_1.ProductService])
    ], CategoryListComponent);
    return CategoryListComponent;
}());
exports.CategoryListComponent = CategoryListComponent;
//# sourceMappingURL=category-list.component.js.map