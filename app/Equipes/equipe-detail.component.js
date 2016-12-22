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
var user_service_1 = require('./../Shared/Services/user.service');
var chart_service_1 = require('./../Shared/Services/chart.service');
var EquipeDetailComponent = (function () {
    function EquipeDetailComponent(dataStore, orderService, userService, chartService) {
        this.dataStore = dataStore;
        this.orderService = orderService;
        this.userService = userService;
        this.chartService = chartService;
        this.initialTab = '';
        this.stateChanged = new core_1.EventEmitter();
    }
    EquipeDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = this.initialTab;
    };
    EquipeDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.equipeObservable.subscribe(function (eq) {
            _this.equipe = eq;
            if (eq) {
                _this.pieSpentChart = _this.chartService.getSpentPieData(_this.equipe.annotation.amountSpent / _this.equipe.annotation.budget * 100);
                _this.usersObservable = _this.dataStore.getDataObservable('users.krino').map(function (users) { return users.filter(function (user) { return _this.equipe.data.userIds.includes(user._id); }); });
                _this.otpsObservable = _this.orderService.getAnnotatedOtpsByEquipe(_this.equipe.data._id);
                _this.ordersObservable = _this.orderService.getAnnotedOrdersByEquipe(eq.data._id);
                _this.orderService.hasEquipeAnyOrder(eq.data._id).subscribe(function (anyOrder) { return _this.anyOrder = anyOrder; });
            }
        });
    };
    EquipeDetailComponent.prototype.setDashlet = function () {
        this.userService.createEquipeDashletForCurrentUser(this.equipe.data._id);
    };
    EquipeDetailComponent.prototype.removeDashlet = function (dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    };
    EquipeDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.equipe && comments) {
            this.equipe.data.comments = comments;
            this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
        }
    };
    EquipeDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    EquipeDetailComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    EquipeDetailComponent.prototype.childOtpsStateChanged = function ($event) {
        this.state.Otps = $event;
        this.stateChanged.next(this.state);
    };
    EquipeDetailComponent.prototype.nameUpdated = function (name) {
        this.equipe.data.name = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };
    EquipeDetailComponent.prototype.descriptionUpdated = function (name) {
        this.equipe.data.description = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };
    EquipeDetailComponent.prototype.nbOfMonthAheadAllowedUpdated = function (nbOfMonths) {
        this.equipe.data.nbOfMonthAheadAllowed = nbOfMonths;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };
    EquipeDetailComponent.prototype.blockedUpdated = function (isBlock) {
        this.equipe.data.isBlocked = isBlock;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], EquipeDetailComponent.prototype, "equipeObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EquipeDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EquipeDetailComponent.prototype, "initialTab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EquipeDetailComponent.prototype, "stateChanged", void 0);
    EquipeDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-detail',
            templateUrl: './equipe-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, order_service_1.OrderService, user_service_1.UserService, chart_service_1.ChartService])
    ], EquipeDetailComponent);
    return EquipeDetailComponent;
}());
exports.EquipeDetailComponent = EquipeDetailComponent;
//# sourceMappingURL=equipe-detail.component.js.map