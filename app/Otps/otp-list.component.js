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
var Rx_1 = require('rxjs/Rx');
var OtpListComponent = (function () {
    function OtpListComponent() {
        this.path = 'otps';
        this.stateChanged = new core_1.EventEmitter();
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    OtpListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    OtpListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        Rx_1.Observable.combineLatest(this.otpsObservable, this.searchControl.valueChanges.startWith(''), function (otps, searchTxt) {
            if (searchTxt.trim() === '')
                return otps;
            return otps.filter(function (otp) { return otp.data.name.toUpperCase().includes(searchTxt.toUpperCase())
                || otp.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase()); });
        }).subscribe(function (otps) { return _this.otps = otps; });
    };
    OtpListComponent.prototype.getOtpObservable = function (id) {
        return this.otpsObservable.map(function (otps) { return otps.filter(function (otp) { return otp.data._id === id; })[0]; });
    };
    OtpListComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    OtpListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    OtpListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OtpListComponent.prototype, "otpsObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OtpListComponent.prototype, "config", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OtpListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], OtpListComponent.prototype, "path", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], OtpListComponent.prototype, "stateChanged", void 0);
    OtpListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-list',
            templateUrl: './otp-list.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], OtpListComponent);
    return OtpListComponent;
}());
exports.OtpListComponent = OtpListComponent;
//# sourceMappingURL=otp-list.component.js.map