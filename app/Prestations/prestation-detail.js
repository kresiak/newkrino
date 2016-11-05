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
var Rx_1 = require('rxjs/Rx');
var forms_1 = require('@angular/forms');
var prestation_service_1 = require('./../Shared/Services/prestation.service');
var PrestationDetailComponent = (function () {
    function PrestationDetailComponent(formBuilder, prestationService) {
        this.formBuilder = formBuilder;
        this.prestationService = prestationService;
        this.stateChanged = new core_1.EventEmitter();
    }
    PrestationDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    /*    private getManipsObservable(): Observable<any>
        {
            return this.prestationObservable.map(prestation => prestation.annotation.manips);
        }
    */
    PrestationDetailComponent.prototype.formManipSheetBuild = function (manips, prestation) {
        var _this = this;
        var groupConfig = {};
        var manipsSheet = prestation.data.manips;
        manips.forEach(function (manip) {
            var groupConfig2 = {};
            var manipSheet = manipsSheet ? manipsSheet.filter(function (manipInSheet) { return manipInSheet.manipId === manip.data._id; })[0] : null;
            groupConfig2['useManip'] = [manipSheet ? manipSheet : ''];
            manip.annotation.products.forEach(function (product) {
                var prodInSheet = manipSheet && manipSheet.products ? manipSheet.products.filter(function (prod) { return prod.productId === product.data._id; })[0] : null;
                groupConfig2[product.data._id] = _this.formBuilder.group({
                    nbUnits: [prodInSheet ? prodInSheet.quantity : '']
                });
            });
            groupConfig[manip.data._id] = _this.formBuilder.group(groupConfig2);
        });
        this.formManipSheet = this.formBuilder.group(groupConfig);
    };
    PrestationDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.prestationObservable.subscribe(function (prestation) {
            _this.prestation = prestation;
            _this.manipsObservable = _this.prestationService.getAnnotatedManipsByLabel(_this.prestation.data.labelId);
            _this.manipsObservable.subscribe(function (manips) {
                _this.manipsPossible = manips;
                if (manips)
                    _this.formManipSheetBuild(manips, prestation);
            });
        });
    };
    PrestationDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    PrestationDetailComponent.prototype.reset = function () {
        this.formManipSheetBuild(this.manipsPossible, this.prestation);
    };
    PrestationDetailComponent.prototype.save = function (formValue, isValid) {
        if (!isValid)
            return;
        var manipsData = this.manipsPossible.filter(function (manip) { return formValue[manip.data._id] && formValue[manip.data._id].useManip; }).map(function (manip) {
            return {
                manipId: manip.data._id,
                products: manip.annotation.products.filter(function (product) { return formValue[manip.data._id][product.data._id] && +formValue[manip.data._id][product.data._id].nbUnits; }).map(function (product) {
                    return {
                        productId: product.data._id,
                        quantity: +formValue[manip.data._id][product.data._id].nbUnits
                    };
                })
            };
        });
        this.prestation.data.manips = manipsData;
        this.prestationService.updatePrestation(this.prestation.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], PrestationDetailComponent.prototype, "prestationObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PrestationDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PrestationDetailComponent.prototype, "stateChanged", void 0);
    PrestationDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-prestation-detail',
            templateUrl: './prestation-detail.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, prestation_service_1.PrestationService])
    ], PrestationDetailComponent);
    return PrestationDetailComponent;
}());
exports.PrestationDetailComponent = PrestationDetailComponent;
//# sourceMappingURL=prestation-detail.js.map