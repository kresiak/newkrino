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
var router_1 = require('@angular/router');
var order_service_1 = require('../Shared/Services/order.service');
var EquipeDetailComponentRoutable = (function () {
    function EquipeDetailComponentRoutable(orderService, route) {
        this.orderService = orderService;
        this.route = route;
    }
    EquipeDetailComponentRoutable.prototype.initData = function (id) {
        var _this = this;
        if (id) {
            this.equipeObservable = this.orderService.getAnnotatedEquipeById(id);
            this.equipeObservable.subscribe(function (obj) {
                _this.equipe = obj;
            });
        }
    };
    EquipeDetailComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.initData(id);
        });
    };
    EquipeDetailComponentRoutable = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './equipe-detail.routable.component.html'
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, router_1.ActivatedRoute])
    ], EquipeDetailComponentRoutable);
    return EquipeDetailComponentRoutable;
}());
exports.EquipeDetailComponentRoutable = EquipeDetailComponentRoutable;
//# sourceMappingURL=equipe-detail.routable.component.js.map