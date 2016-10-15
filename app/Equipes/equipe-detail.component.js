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
var Rx_1 = require('rxjs/Rx');
var EquipeDetailComponent = (function () {
    function EquipeDetailComponent(apiService) {
        this.apiService = apiService;
    }
    EquipeDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        Rx_1.Observable.forkJoin([
            this.apiService.crudGetRecord('equipes', this.equipeId), this.apiService.crudGetRecords("krinousers"), this.apiService.crudGetRecords("otps")
        ]).subscribe(function (data) {
            _this.equipe = data[0];
            _this.equipe.users = data[1].filter(function (user) { return _this.equipe.Users.includes(user._id); });
            _this.equipe.otps = data[2].filter(function (otp) { return otp.Equipe === _this.equipeId; });
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EquipeDetailComponent.prototype, "equipeId", void 0);
    EquipeDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-detail',
            templateUrl: './equipe-detail.component.html'
        }), 
        __metadata('design:paramtypes', [api_service_1.ApiService])
    ], EquipeDetailComponent);
    return EquipeDetailComponent;
}());
exports.EquipeDetailComponent = EquipeDetailComponent;
//# sourceMappingURL=equipe-detail.component.js.map