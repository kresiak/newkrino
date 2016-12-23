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
var order_service_1 = require('./../Shared/Services/order.service');
var Rx_1 = require('rxjs/Rx');
var EquipeListComponent = (function () {
    function EquipeListComponent(orderService) {
        this.orderService = orderService;
        this.initialTabInEquipeDetail = '';
        this.stateChanged = new core_1.EventEmitter();
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    EquipeListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    EquipeListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.equipesObservable = this.orderService.getAnnotatedEquipes();
        Rx_1.Observable.combineLatest(this.equipesObservable, this.searchControl.valueChanges.startWith(''), function (equipes, searchTxt) {
            if (searchTxt.trim() === '')
                return equipes;
            return equipes.filter(function (otp) { return otp.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || otp.data.description.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (equipes) { return _this.equipes = equipes; });
    };
    EquipeListComponent.prototype.getEquipeObservable = function (id) {
        return this.equipesObservable.map(function (equipes) { return equipes.filter(function (s) { return s.data._id === id; })[0]; });
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    EquipeListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    EquipeListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EquipeListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EquipeListComponent.prototype, "initialTabInEquipeDetail", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EquipeListComponent.prototype, "path", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EquipeListComponent.prototype, "stateChanged", void 0);
    EquipeListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-list',
            templateUrl: './equipe-list.component.html'
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService])
    ], EquipeListComponent);
    return EquipeListComponent;
}());
exports.EquipeListComponent = EquipeListComponent;
//# sourceMappingURL=equipe-list.component.js.map