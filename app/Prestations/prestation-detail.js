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
var PrestationDetailComponent = (function () {
    function PrestationDetailComponent() {
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
    PrestationDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.prestationObservable.subscribe(function (prestation) {
            _this.prestation = prestation;
        });
    };
    PrestationDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
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
        __metadata('design:paramtypes', [])
    ], PrestationDetailComponent);
    return PrestationDetailComponent;
}());
exports.PrestationDetailComponent = PrestationDetailComponent;
//# sourceMappingURL=prestation-detail.js.map