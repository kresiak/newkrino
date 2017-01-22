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
var AdminWebShoppingComponent = (function () {
    function AdminWebShoppingComponent() {
        this.stateChanged = new core_1.EventEmitter();
    }
    AdminWebShoppingComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    AdminWebShoppingComponent.prototype.ngOnInit = function () {
        this.stateInit();
    };
    AdminWebShoppingComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AdminWebShoppingComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], AdminWebShoppingComponent.prototype, "stateChanged", void 0);
    AdminWebShoppingComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-admin-webshopping',
            templateUrl: './component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], AdminWebShoppingComponent);
    return AdminWebShoppingComponent;
}());
exports.AdminWebShoppingComponent = AdminWebShoppingComponent;
//# sourceMappingURL=component.js.map