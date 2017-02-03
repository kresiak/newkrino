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
var prestation_service_1 = require('./../Shared/Services/prestation.service');
var ManipListComponent = (function () {
    function ManipListComponent(prestationService) {
        this.prestationService = prestationService;
        this.stateChanged = new core_1.EventEmitter();
    }
    ManipListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    ManipListComponent.prototype.ngOnInit = function () {
        this.stateInit();
        this.manips = this.prestationService.getAnnotatedManipsAll();
    };
    ManipListComponent.prototype.getManipObservable = function (id) {
        return this.manips.map(function (manips) { return manips.filter(function (s) { return s.data._id === id; })[0]; });
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    ManipListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    ManipListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ManipListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ManipListComponent.prototype, "stateChanged", void 0);
    ManipListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './manip-list.component.html'
        }), 
        __metadata('design:paramtypes', [prestation_service_1.PrestationService])
    ], ManipListComponent);
    return ManipListComponent;
}());
exports.ManipListComponent = ManipListComponent;
//# sourceMappingURL=manip-list.component.js.map