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
var Editor = (function () {
    // We use ElementRef in order to obtain our editable element for later use
    function Editor(elementRef) {
        this.elementRef = elementRef;
        // Creating a host element class attribute binding from the editMode property
        this.editMode = false;
        this.isMonetary = false;
        this.editSaved = new core_1.EventEmitter();
        this.editableInput = new core_1.EventEmitter();
    }
    Editor.prototype.resetContent = function (newcontent) {
        this.content = newcontent;
        this.setEditableContent(newcontent);
    };
    Editor.prototype.ngAfterViewInit = function () {
        this.setEditableContent(this.content);
    };
    Editor.prototype.ngOnInit = function () {
        this.editableContentElement = this.elementRef.nativeElement.querySelector('.editor__editable-content');
    };
    // We need to make sure to reflect to our editable element if content gets updated from outside
    Editor.prototype.ngOnChanges = function (changes) {
        if (changes.content && this.editableContentElement) {
            this.setEditableContent(changes.content.currentValue);
        }
    };
    // This returns the content of our content editable
    Editor.prototype.getEditableContent = function () {
        return this.editableContentElement.textContent;
    };
    // This sets the content of our content editable
    Editor.prototype.setEditableContent = function (content) {
        this.editableContentElement.textContent = content;
    };
    // This annotation will create a click event listener on the host element that will invoke the underlying method
    Editor.prototype.focusEditableContent = function () {
        if (this.editMode) {
            this.editableContentElement.focus();
        }
    };
    // Method that will be invoked if our editable element is changed
    Editor.prototype.onInput = function () {
        // Emit a editableInput event with the edited content
        this.editableInput.next(this.getEditableContent());
    };
    // On save we reflect the content of the editable element into the content field and emit an event
    Editor.prototype.save = function () {
        this.content = this.getEditableContent();
        this.editSaved.next(this.content);
        // Setting editMode to false to switch the editor back to viewing mode
        this.editMode = false;
    };
    // Canceling the edit will not reflect the edited content and switch back to viewing mode
    Editor.prototype.cancel = function () {
        this.setEditableContent(this.content);
        this.editableInput.next(this.getEditableContent());
        this.editMode = false;
    };
    // The edit method will initialize the editable element and set the component into edit mode
    Editor.prototype.edit = function () {
        this.editMode = true;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Editor.prototype, "content", void 0);
    __decorate([
        core_1.Input(),
        core_1.HostBinding('class.editor--edit-mode'), 
        __metadata('design:type', Object)
    ], Editor.prototype, "editMode", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Editor.prototype, "showControls", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], Editor.prototype, "isMonetary", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Editor.prototype, "editSaved", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Editor.prototype, "editableInput", void 0);
    __decorate([
        core_1.HostListener('click'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], Editor.prototype, "focusEditableContent", null);
    Editor = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-editor',
            host: {
                'class': 'editor'
            },
            templateUrl: './editor.html',
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], Editor);
    return Editor;
}());
exports.Editor = Editor;
//# sourceMappingURL=editor.js.map