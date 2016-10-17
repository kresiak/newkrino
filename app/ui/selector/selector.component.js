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
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
var SelectorComponent = (function () {
    // We use ElementRef in order to obtain our editable element for later use
    function SelectorComponent(modalService) {
        this.modalService = modalService;
        this.nbSelectable = 1;
        this.editMode = false;
        this.editSaved = new core_1.EventEmitter();
    }
    SelectorComponent.prototype.openModal = function (template) {
        var _this = this;
        this.data.forEach(function (d) { return d.savePresentState(); });
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then(function (res) {
            _this.save();
        });
        promise.catch(function (err) {
            _this.cancel();
        });
        this.editMode = true;
    };
    SelectorComponent.prototype.ngAfterViewInit = function () {
        this.constructContent();
    };
    SelectorComponent.prototype.ngOnInit = function () {
    };
    // We need to make sure to reflect to our editable element if content gets updated from outside
    SelectorComponent.prototype.onChanges = function (changes) {
        if (changes.data) {
            this.data = changes.data;
            if (this.editMode) {
                this.data.forEach(function (d) { return d.savePresentState(); });
            }
            else {
                this.constructContent();
            }
        }
    };
    SelectorComponent.prototype.constructContent = function () {
        var list = this.data.filter(function (item) { return item.selected; }).map(function (item) { return item.name; });
        this.content = list && list.length > 0 ? list.reduce(function (u, v) { return u + ', ' + v; }) : 'nothing yet';
    };
    // On save we reflect the content of the editable element into the content field and emit an event
    SelectorComponent.prototype.save = function () {
        this.constructContent();
        this.editSaved.next(this.data);
        // Setting editMode to false to switch the editor back to viewing mode
        this.editMode = false;
    };
    // Canceling the edit will not reflect the edited content and switch back to viewing mode
    SelectorComponent.prototype.cancel = function () {
        this.data.forEach(function (d) { return d.restoreFromSavedState(); });
        this.editMode = false;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], SelectorComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], SelectorComponent.prototype, "nbSelectable", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectorComponent.prototype, "editSaved", void 0);
    SelectorComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-selector',
            host: {
                'class': 'editor'
            },
            templateUrl: './selector.component.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [ng_bootstrap_1.NgbModal])
    ], SelectorComponent);
    return SelectorComponent;
}());
exports.SelectorComponent = SelectorComponent;
//# sourceMappingURL=selector.component.js.map