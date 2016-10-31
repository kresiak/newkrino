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
var editor_1 = require('../ui/editor/editor');
var user_service_1 = require('../Shared/Services/user.service');
var CommentsComponent = (function () {
    function CommentsComponent(userService) {
        this.userService = userService;
        this.commentsUpdated = new core_1.EventEmitter();
    }
    CommentsComponent.prototype.ngOnInit = function () {
        if (!this.comments) {
            this.comments = [];
        }
    };
    CommentsComponent.prototype.onChanges = function (changes) {
        if (changes.comments && changes.comments.currentValue === undefined) {
            this.comments = [];
        }
    };
    CommentsComponent.prototype.addNewComment = function () {
        var _this = this;
        this.userService.getCurrentUserObjectForComment().first().subscribe(function (userrecord) {
            var comments = _this.comments.slice();
            comments.splice(0, 0, {
                user: userrecord,
                time: +new Date(),
                content: _this.newCommentEditor.getEditableContent()
            });
            _this.commentsUpdated.next(comments);
            _this.newCommentEditor.setEditableContent('');
        });
    };
    CommentsComponent.prototype.onCommentEdited = function (comment, content) {
        var comments = this.comments.slice();
        if (content.length === 0) {
            comments.splice(comments.indexOf(comment), 1);
        }
        else {
            comments.splice(comments.indexOf(comment), 1, {
                user: comment.user,
                time: comment.time,
                content: content
            });
        }
        this.commentsUpdated.next(comments);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CommentsComponent.prototype, "comments", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], CommentsComponent.prototype, "commentsUpdated", void 0);
    __decorate([
        core_1.ViewChild(editor_1.Editor), 
        __metadata('design:type', Object)
    ], CommentsComponent.prototype, "newCommentEditor", void 0);
    CommentsComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-comments',
            host: {
                'class': 'comments'
            },
            templateUrl: './comments.component.html'
        }), 
        __metadata('design:paramtypes', [user_service_1.UserService])
    ], CommentsComponent);
    return CommentsComponent;
}());
exports.CommentsComponent = CommentsComponent;
//# sourceMappingURL=comments.component.js.map