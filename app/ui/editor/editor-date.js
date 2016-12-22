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
var moment = require("moment");
var EditorDate = (function () {
    function EditorDate() {
        this.editMode = false;
        this.editSaved = new core_1.EventEmitter();
    }
    EditorDate.prototype.toDatePickerDateObject = function (date) {
        var md;
        if (!date || date.trim() === '') {
            this.content = 'Choose a date';
            md = moment();
        }
        else {
            md = moment(date, 'DD/MM/YYYY hh:mm:ss');
        }
        var obj = { year: md.year(), month: md.month() + 1, day: md.date() };
        return obj;
    };
    EditorDate.prototype.fromDatePickerDateObjec = function (obj) {
        var md = moment();
        md.date(obj.day);
        md.month(obj.month - 1);
        md.year(obj.year);
        return md.format('DD/MM/YYYY hh:mm:ss');
    };
    EditorDate.prototype.emptyContent = function () {
        this.contentEdited = this.toDatePickerDateObject('');
    };
    EditorDate.prototype.ngOnInit = function () {
        this.contentEdited = this.toDatePickerDateObject(this.content);
    };
    EditorDate.prototype.ngOnChanges = function (changes) {
        if (changes.content) {
            this.contentEdited = this.toDatePickerDateObject(this.content);
        }
    };
    EditorDate.prototype.save = function () {
        this.content = this.fromDatePickerDateObjec(this.contentEdited);
        this.editSaved.next(this.content);
        this.editMode = false;
    };
    EditorDate.prototype.cancel = function () {
        this.contentEdited = this.savedContentEdited;
        this.editMode = false;
    };
    EditorDate.prototype.edit = function () {
        this.savedContentEdited = this.contentEdited;
        this.editMode = true;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EditorDate.prototype, "content", void 0);
    __decorate([
        core_1.Input(),
        core_1.HostBinding('class.editor--edit-mode'), 
        __metadata('design:type', Object)
    ], EditorDate.prototype, "editMode", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EditorDate.prototype, "editSaved", void 0);
    EditorDate = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-editor-date',
            host: {
                'class': 'editor'
            },
            templateUrl: './editor-date.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [])
    ], EditorDate);
    return EditorDate;
}());
exports.EditorDate = EditorDate;
//# sourceMappingURL=editor-date.js.map