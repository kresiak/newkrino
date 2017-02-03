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
var Rx_1 = require('rxjs/Rx');
var SelectorComponent = (function () {
    function SelectorComponent(modalService) {
        this.modalService = modalService;
        //@Input() nbSelectable: number = 1;
        this.editMode = false;
        this.selectionChanged = new core_1.EventEmitter();
        this.selectionOptionAdded = new core_1.EventEmitter();
        this.isDisconnectedFromData = false;
    }
    SelectorComponent.prototype.ngOnInit = function () {
        if (!this.selectedIds) {
            this.selectedIds = Rx_1.Observable.from([[]]);
            this.pictureselectedIds = [];
            this.isDisconnectedFromData = true;
        }
        this.initContent(this.selectedIds);
    };
    SelectorComponent.prototype.initContent = function (selectedIds) {
        var _this = this;
        this.selectableData.combineLatest(selectedIds, function (sdata, ids) {
            var selectedItems = sdata && ids ? sdata.filter(function (item) { return ids.includes(item.id); }) : [];
            return selectedItems.length > 0 ? selectedItems.map(function (item) { return item.name; }).reduce(function (u, v) { return u + ', ' + v; }) : 'nothing yet';
        }).subscribe(function (txt) {
            return _this.content = txt;
        });
    };
    SelectorComponent.prototype.emptyContent = function () {
        this.selectedIds = Rx_1.Observable.from([[]]);
        this.pictureselectedIds = [];
        this.initContent(this.selectedIds);
    };
    SelectorComponent.prototype.openModal = function (template) {
        var _this = this;
        if (!this.isDisconnectedFromData)
            this.selectedIds.subscribe(function (ids) { return _this.pictureselectedIds = ids ? ids.slice(0) : []; });
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then(function (res) {
            _this.save();
        }, function (res) {
            _this.cancel();
        });
        promise.catch(function (err) {
            _this.cancel();
        });
        this.editMode = true;
    };
    SelectorComponent.prototype.setItemSelection = function (item, isSelected) {
        if (isSelected && !this.pictureselectedIds.includes(item.id)) {
            this.pictureselectedIds.push(item.id);
        }
        if (!isSelected && this.pictureselectedIds.includes(item.id)) {
            var pos = this.pictureselectedIds.findIndex(function (id) { return item.id === id; });
            this.pictureselectedIds.splice(pos, 1);
        }
    };
    SelectorComponent.prototype.isItemSelected = function (item) {
        return this.pictureselectedIds.includes(item.id);
    };
    SelectorComponent.prototype.save = function () {
        this.initContent(Rx_1.Observable.from([this.pictureselectedIds]));
        this.selectionChanged.next(this.pictureselectedIds);
        this.editMode = false;
    };
    SelectorComponent.prototype.cancel = function () {
        this.editMode = false;
    };
    SelectorComponent.prototype.enterNewSelectableItem = function (newItem) {
        if (newItem.value.trim().length < 2)
            return;
        this.selectionOptionAdded.next(newItem.value);
        newItem.value = '';
        newItem.focus();
    };
    SelectorComponent.prototype.onKeyDown = function (event) {
        if (event.keyCode === 13) {
            this.enterNewSelectableItem(event.target);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], SelectorComponent.prototype, "selectableData", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], SelectorComponent.prototype, "selectedIds", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectorComponent.prototype, "selectionChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectorComponent.prototype, "selectionOptionAdded", void 0);
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