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
var hero_service_1 = require('./hero.service');
var router_1 = require('@angular/router');
var selectable_data_1 = require('./Shared/Classes/selectable-data');
var Rx_1 = require('rxjs/Rx');
var DashboardComponent = (function () {
    function DashboardComponent(heroService, router) {
        this.heroService = heroService;
        this.router = router;
        this.heroes = [];
        this.selectableData = [
            new selectable_data_1.SelectableData("1", "Enzymes"),
            new selectable_data_1.SelectableData("2", "Produits chimiques"),
            new selectable_data_1.SelectableData("3", "Informatique"),
            new selectable_data_1.SelectableData("4", "Divers"),
            new selectable_data_1.SelectableData("5", "Taq"),
            new selectable_data_1.SelectableData("6", "Autres"),
            new selectable_data_1.SelectableData("7", "Enzymes"),
        ];
        this.selectedIds = ["1", "5"];
        this.selectableCategoriesObservable = Rx_1.Observable.from([this.selectableData]);
        var self = this;
        this.selectedIdsObservable = new Rx_1.BehaviorSubject([]);
        this.selectedIdsObservable.next(this.selectedIds);
        var self = this;
        window.setTimeout(function () {
            self.selectedIds.push("2");
            self.selectedIdsObservable.next(self.selectedIds);
        }, 5000);
    }
    DashboardComponent.prototype.selectedChanged = function (newSelection) {
        this.selectedIdsObservable.next(newSelection);
    };
    DashboardComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.heroService.getHeroes().then(function (h) { return _this.heroes = h.slice(1, 5); });
    };
    DashboardComponent.prototype.gotoDetail = function (hero) {
        var link = ['/detail', hero.id];
        this.router.navigate(link);
    };
    DashboardComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-dashboard',
            templateUrl: 'dashboard.component.html'
        }), 
        __metadata('design:paramtypes', [hero_service_1.HeroService, router_1.Router])
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;
//# sourceMappingURL=dashboard.component.js.map