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
var ManipDetailComponent = (function () {
    function ManipDetailComponent() {
        this.stateChanged = new core_1.EventEmitter();
    }
    ManipDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    ManipDetailComponent.prototype.getProductsObservable = function () {
        return this.manipObservable.map(function (manip) { return manip.annotation.products; });
    };
    ManipDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.manipObservable.subscribe(function (manip) {
            _this.manip = manip;
        });
    };
    ManipDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], ManipDetailComponent.prototype, "manipObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ManipDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ManipDetailComponent.prototype, "stateChanged", void 0);
    ManipDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-manip-detail',
            templateUrl: './manip-detail.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], ManipDetailComponent);
    return ManipDetailComponent;
}());
exports.ManipDetailComponent = ManipDetailComponent;
//# sourceMappingURL=manip-detail.component.js.map