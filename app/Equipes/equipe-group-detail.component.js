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
var data_service_1 = require('./../Shared/Services/data.service');
var order_service_1 = require('./../Shared/Services/order.service');
var Rx_1 = require('rxjs/Rx');
var auth_service_1 = require('../Shared/Services/auth.service');
var EquipeGroupDetailComponent = (function () {
    function EquipeGroupDetailComponent(dataStore, orderService, authService) {
        this.dataStore = dataStore;
        this.orderService = orderService;
        this.authService = authService;
        this.isRoot = false;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
    }
    EquipeGroupDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
    };
    EquipeGroupDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.equipeGroupObservable.subscribe(function (eq) {
            _this.equipeGroup = eq;
        });
        this.selectableEquipes = this.orderService.getSelectableEquipes();
        this.selectedEquipeIdsObservable = this.equipeGroupObservable.map(function (group) { return group.data.equipeIds.map(function (idObj) { return idObj.id; }); });
        this.authService.getStatusObservable().subscribe(function (statusInfo) {
            _this.authorizationStatusInfo = statusInfo;
        });
    };
    EquipeGroupDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.equipeGroup && comments) {
            this.equipeGroup.data.comments = comments;
            this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
        }
    };
    EquipeGroupDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    EquipeGroupDetailComponent.prototype.nameUpdated = function (name) {
        this.equipeGroup.data.name = name;
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    };
    EquipeGroupDetailComponent.prototype.descriptionUpdated = function (name) {
        this.equipeGroup.data.description = name;
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    };
    EquipeGroupDetailComponent.prototype.equipeSelectionChanged = function (selectedEquipeIds) {
        var _this = this;
        this.equipeGroup.data.equipeIds = this.equipeGroup.data.equipeIds.filter(function (element) { return selectedEquipeIds.includes(element.id); });
        selectedEquipeIds.filter(function (id) { return !_this.equipeGroup.data.equipeIds.map(function (element) { return element.id; }).includes(id); }).forEach(function (id) {
            _this.equipeGroup.data.equipeIds.push({
                id: id,
                weight: 1
            });
        });
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    };
    EquipeGroupDetailComponent.prototype.weightupdated = function (item, newQuantity) {
        item.weight = newQuantity;
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], EquipeGroupDetailComponent.prototype, "equipeGroupObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EquipeGroupDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EquipeGroupDetailComponent.prototype, "path", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], EquipeGroupDetailComponent.prototype, "isRoot", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EquipeGroupDetailComponent.prototype, "initialTab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EquipeGroupDetailComponent.prototype, "stateChanged", void 0);
    EquipeGroupDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-group-detail',
            templateUrl: './equipe-group-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, order_service_1.OrderService, auth_service_1.AuthService])
    ], EquipeGroupDetailComponent);
    return EquipeGroupDetailComponent;
}());
exports.EquipeGroupDetailComponent = EquipeGroupDetailComponent;
//# sourceMappingURL=equipe-group-detail.component.js.map