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
var api_service_1 = require('./../Shared/Services/api.service');
var EquipeListComponent = (function () {
    function EquipeListComponent(apiService) {
        this.apiService = apiService;
        this.equipes = [];
    }
    EquipeListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.apiService.crudGetRecords('equipes').subscribe(function (res) {
            _this.equipes = res;
        }, function (err) { return console.log(err); });
    };
    EquipeListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './equipe-list.component.html'
        }), 
        __metadata('design:paramtypes', [api_service_1.ApiService])
    ], EquipeListComponent);
    return EquipeListComponent;
}());
exports.EquipeListComponent = EquipeListComponent;
//# sourceMappingURL=equipe-list.component.js.map