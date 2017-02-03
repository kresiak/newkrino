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
var EquipeEnterComponent = (function () {
    function EquipeEnterComponent(dataStore, formBuilder, authService) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
        this.authService = authService;
    }
    EquipeEnterComponent.prototype.ngOnInit = function () {
        this.selectableUsers = this.authService.getSelectableUsers();
        this.equipeForm = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            description: ['', forms_1.Validators.required],
            nbOfMonthAheadAllowed: [''],
            isBlocked: ['']
        });
    };
    EquipeEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('equipes', {
            name: formValue.name,
            description: formValue.description,
            nbOfMonthAheadAllowed: formValue.nbOfMonthAheadAllowed,
            isBlocked: formValue.isBlocked,
            userIds: this.selectedUserIds
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    EquipeEnterComponent.prototype.reset = function () {
        this.equipeForm.reset();
        this.usersChild.emptyContent();
    };
    EquipeEnterComponent.prototype.userSelectionChanged = function (selectedUserIds) {
        this.selectedUserIds = selectedUserIds;
    };
    __decorate([
        core_1.ViewChild('userSelector'), 
        __metadata('design:type', Object)
    ], EquipeEnterComponent.prototype, "usersChild", void 0);
    EquipeEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-enter',
            templateUrl: './equipe-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder, auth_service_1.AuthService])
    ], EquipeEnterComponent);
    return EquipeEnterComponent;
}());
exports.EquipeEnterComponent = EquipeEnterComponent;
//# sourceMappingURL=equipe-enter.component.js.map