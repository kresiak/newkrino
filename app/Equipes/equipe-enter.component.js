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
var EquipeEnterComponent = (function () {
    function EquipeEnterComponent(dataStore, formBuilder) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
    }
    EquipeEnterComponent.prototype.ngOnInit = function () {
        this.equipeForm = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            description: ['', forms_1.Validators.required],
            nbOfMonthAheadAllowed: [''],
            isBlocked: [''],
            userIds: ['']
        });
    };
    EquipeEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('equipes', {
            name: formValue.name,
            description: formValue.description,
            nbOfMonthAheadAllowed: formValue.nbOfMonthAheadAllowed,
            isBlocked: formValue.isBlocked,
            userIds: ['58402ef9f9690561d454c325', '58402ef9f9690561d454c342', '58402ef9f9690561d454c351']
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    EquipeEnterComponent.prototype.reset = function () {
        this.equipeForm.reset();
    };
    EquipeEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-equipe-enter',
            templateUrl: './equipe-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder])
    ], EquipeEnterComponent);
    return EquipeEnterComponent;
}());
exports.EquipeEnterComponent = EquipeEnterComponent;
//# sourceMappingURL=equipe-enter.component.js.map