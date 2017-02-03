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
var Checkbox = (function () {
    function Checkbox() {
        this.checked = false;
        this.checkedChange = new core_1.EventEmitter();
    }
    Checkbox.prototype.onCheckedChange = function (checked) {
        this.checkedChange.next(checked);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Checkbox.prototype, "label", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Checkbox.prototype, "checked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Checkbox.prototype, "checkedChange", void 0);
    Checkbox = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-checkbox',
            host: {
                'class': 'checkbox'
            },
            templateUrl: './checkbox.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [])
    ], Checkbox);
    return Checkbox;
}());
exports.Checkbox = Checkbox;
//# sourceMappingURL=checkbox.js.map