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
var CommentComponent = (function () {
    function CommentComponent() {
        this.commentEdited = new core_1.EventEmitter();
    }
    CommentComponent.prototype.onEditSaved = function (content) {
        this.commentEdited.next(content);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CommentComponent.prototype, "time", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CommentComponent.prototype, "user", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CommentComponent.prototype, "content", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], CommentComponent.prototype, "commentEdited", void 0);
    CommentComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-comment',
            host: {
                'class': 'comment'
            },
            templateUrl: './comment.component.html',
            encapsulation: core_1.ViewEncapsulation.None,
        }), 
        __metadata('design:paramtypes', [])
    ], CommentComponent);
    return CommentComponent;
}());
exports.CommentComponent = CommentComponent;
//# sourceMappingURL=comment.component.js.map