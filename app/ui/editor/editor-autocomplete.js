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
var platform_browser_1 = require("@angular/platform-browser");
var EditorAutocomplete = (function () {
    function EditorAutocomplete(_sanitizer) {
        var _this = this;
        this._sanitizer = _sanitizer;
        this.editMode = false;
        this.idChanged = new core_1.EventEmitter();
        this.autocompleListFormatter = function (data) {
            var html = "<span>" + data.name + "</span>";
            return _this._sanitizer.bypassSecurityTrustHtml(html);
        };
    }
    EditorAutocomplete.prototype.initContent = function (selectedId) {
        var _this = this;
        this.selectableData.combineLatest(selectedId, function (sdata, id) {
            var selectedItem = sdata && id ? sdata.filter(function (item) { return id === item.id; })[0] : undefined;
            return selectedItem;
        }).subscribe(function (item) {
            _this.selectedItem = item;
            _this.content = item ? item.name : '';
        });
    };
    EditorAutocomplete.prototype.ngOnInit = function () {
        this.initContent(Rx_1.Observable.from([this.selectedId]));
    };
    EditorAutocomplete.prototype.save = function () {
        this.idChanged.next(this.selectedItem.id);
        this.initContent(Rx_1.Observable.from([this.selectedItem.id]));
        this.editMode = false;
    };
    EditorAutocomplete.prototype.cancel = function () {
        this.editMode = false;
    };
    EditorAutocomplete.prototype.edit = function () {
        this.editMode = true;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], EditorAutocomplete.prototype, "selectableData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], EditorAutocomplete.prototype, "selectedId", void 0);
    __decorate([
        core_1.Input(),
        core_1.HostBinding('class.editor--edit-mode'), 
        __metadata('design:type', Object)
    ], EditorAutocomplete.prototype, "editMode", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], EditorAutocomplete.prototype, "idChanged", void 0);
    EditorAutocomplete = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-editor-autocomplete',
            host: {
                'class': 'editor'
            },
            templateUrl: './editor-autocomplete.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizer])
    ], EditorAutocomplete);
    return EditorAutocomplete;
}());
exports.EditorAutocomplete = EditorAutocomplete;
//# sourceMappingURL=editor-autocomplete.js.map