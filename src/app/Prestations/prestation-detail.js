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
var auth_service_1 = require('./../Shared/Services/auth.service');
var product_service_1 = require('./../Shared/Services/product.service');
var PrestationDetailComponent = (function () {
    function PrestationDetailComponent(formBuilder, prestationService, authService, productService) {
        this.formBuilder = formBuilder;
        this.prestationService = prestationService;
        this.authService = authService;
        this.productService = productService;
        this.stateChanged = new core_1.EventEmitter();
        this.collapseStatus = {};
    }
    PrestationDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    PrestationDetailComponent.prototype.isCollapseOpen = function (id) {
        if (!(id in this.collapseStatus))
            this.collapseStatus[id] = true;
        return this.collapseStatus[id];
    };
    PrestationDetailComponent.prototype.toggleCollapse = function (id) {
        if (!(id in this.collapseStatus))
            this.collapseStatus[id] = true;
        this.collapseStatus[id] = !this.collapseStatus[id];
    };
    PrestationDetailComponent.prototype.formManipSheetBuild = function (possibleManips, currentPrestation) {
        var _this = this;
        this.formManipSheet = new forms_1.FormGroup({});
        var manipsSheet = currentPrestation.data.manips;
        possibleManips.forEach(function (manip) {
            var grpManip = new forms_1.FormGroup({});
            _this.formManipSheet.addControl(manip.data._id, grpManip);
            var manipSheet = manipsSheet ? manipsSheet.filter(function (manipInSheet) { return manipInSheet.manipId === manip.data._id; })[0] : null;
            grpManip.addControl('useManip', new forms_1.FormControl(manipSheet));
            manip.annotation.products.forEach(function (product) {
                var prodInSheet = manipSheet && manipSheet.products ? manipSheet.products.filter(function (prod) { return prod.productId === product.data._id; })[0] : null;
                var grpProduct = new forms_1.FormGroup({});
                grpManip.addControl(product.data._id, grpProduct);
                grpProduct.addControl('nbUnits', new forms_1.FormControl(prodInSheet ? prodInSheet.quantity : ''));
            });
        });
    };
    PrestationDetailComponent.prototype.getStockProductObservable = function (id) {
        return this.stockProductsObservable.map(function (products) {
            var product = products.filter(function (s) { return s.key === id; })[0];
            return product;
        });
    };
    PrestationDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.stockProductsObservable = this.productService.getAnnotatedAvailableStockProductsAll();
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
    PrestationDetailComponent.prototype.logHours = function (nbHours, manip) {
        if (!+nbHours || +nbHours <= 0)
            return;
        if (!manip.worklogs)
            manip.worklogs = [];
        manip.worklogs.push({
            nbHours: +nbHours,
            userId: this.authService.getUserId(),
            date: new Date()
        });
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
        __metadata('design:paramtypes', [forms_1.FormBuilder, prestation_service_1.PrestationService, auth_service_1.AuthService, product_service_1.ProductService])
    ], PrestationDetailComponent);
    return PrestationDetailComponent;
}());
exports.PrestationDetailComponent = PrestationDetailComponent;
//# sourceMappingURL=prestation-detail.js.map