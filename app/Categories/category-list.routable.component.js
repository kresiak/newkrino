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
var navigation_service_1 = require('../Shared/Services/navigation.service');
var CategoryListComponentRoutable = (function () {
    function CategoryListComponentRoutable(navigationService) {
        this.navigationService = navigationService;
    }
    CategoryListComponentRoutable.prototype.ngAfterViewInit = function () {
        this.navigationService.jumpToOpenRootAccordionElement();
    };
    CategoryListComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.navigationService.getStateObservable().subscribe(function (state) {
            _this.state = state;
        });
    };
    CategoryListComponentRoutable = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './category-list.routable.component.html'
        }), 
        __metadata('design:paramtypes', [navigation_service_1.NavigationService])
    ], CategoryListComponentRoutable);
    return CategoryListComponentRoutable;
}());
exports.CategoryListComponentRoutable = CategoryListComponentRoutable;
//# sourceMappingURL=category-list.routable.component.js.map