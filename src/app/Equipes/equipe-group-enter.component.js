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
var data_service_1 = require('./../Shared/Services/data.service');
var auth_service_1 = require('../Shared/Services/auth.service');
var order_service_1 = require('../Shared/Services/order.service');
var EquipeGroupEnterComponent = (function () {
    function EquipeGroupEnterComponent(dataStore, formBuilder, authService, orderService) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.orderService = orderService;
    }
    EquipeGroupEnterComponent.prototype.ngOnInit = function () {
        this.selectableEquipes = this.orderService.getSelectableEquipes();
        this.equipeForm = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            description: ['', forms_1.Validators.required]
        });
    };
    EquipeGroupEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('equipes.groups', {
            name: formValue.name,
            description: formValue.description,
            equipeIds: this.selectedEquipeIds.map(function (id) {
                return {
                    id: id,
                    weight: 1
                };
            })
        }).subscribe(function (res) {
            _this.reset();
        });
    };
    EquipeGroupEnterComponent.prototype.reset = function () {
        this.equipeForm.reset();
        this.equipesChild.emptyContent();
    };
    EquipeGroupEnterComponent.prototype.equipeSelectionChanged = function (selectedEquipeIds) {
        this.selectedEquipeIds = selectedEquipeIds;
    };
    __decorate([
        core_1.ViewChild('equipeSelector'), 
        __metadata('design:type', Object)
    ], EquipeGroupEnterComponent.prototype, "equipesChild", void 0);
    EquipeGroupEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-group-enter',
            templateUrl: './equipe-group-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder, auth_service_1.AuthService, order_service_1.OrderService])
    ], EquipeGroupEnterComponent);
    return EquipeGroupEnterComponent;
}());
exports.EquipeGroupEnterComponent = EquipeGroupEnterComponent;
//# sourceMappingURL=equipe-group-enter.component.js.map