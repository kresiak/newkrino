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
var EditorNumber = (function () {
    function EditorNumber() {
        this.minimumValue = 0;
        this.editMode = false;
        this.editSaved = new core_1.EventEmitter();
    }
    EditorNumber.prototype.ngOnInit = function () {
        this.contentEdited = this.content;
    };
    EditorNumber.prototype.ngOnChanges = function (changes) {
        if (changes.content) {
            this.contentEdited = changes.content.currentValue;
        }
    };
    EditorNumber.prototype.save = function () {
        this.content = this.contentEdited;
        this.editSaved.next(this.content);
        this.editMode = false;
    };
    EditorNumber.prototype.cancel = function () {
        this.contentEdited = this.content;
        this.editMode = false;
    };
    EditorNumber.prototype.edit = function () {
        this.editMode = true;
    };
    EditorNumber.prototype.validate = function (value) {
        var v = +value ? +value : 0;
        v < this.minimumValue ? this.contentEdited = this.minimumValue : this.contentEdited = v;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EditorNumber.prototype, "content", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], EditorNumber.prototype, "minimumValue", void 0);
    __decorate([
        core_1.Input(),
        core_1.HostBinding('class.editor--edit-mode'), 
        __metadata('design:type', Object)
    ], EditorNumber.prototype, "editMode", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EditorNumber.prototype, "editSaved", void 0);
    EditorNumber = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-editor-number',
            host: {
                'class': 'editor'
            },
            templateUrl: './editor-number.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [])
    ], EditorNumber);
    return EditorNumber;
}());
exports.EditorNumber = EditorNumber;
//# sourceMappingURL=editor-number.js.map