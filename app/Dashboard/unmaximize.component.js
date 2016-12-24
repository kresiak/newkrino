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
var router_1 = require('@angular/router');
var UnMaximizeComponent = (function () {
    function UnMaximizeComponent(route) {
        this.route = route;
    }
    UnMaximizeComponent.prototype.getState = function (arrPath) {
        var result = arrPath.reduce(function (acc, item) {
            if (!acc.current)
                acc.current = acc.result;
            var arr = item.split(':');
            var value = arr[1];
            switch (arr[0]) {
                case 'P':
                    acc.current.openPanelId = value;
                    break;
                case 'O':
                    acc.current.selectedTabId = 'tab' + value;
                    break;
            }
            acc.current[value] = {};
            acc.current = acc.current[value];
            return acc;
        }, { result: {}, current: null });
        return result.result;
    };
    UnMaximizeComponent.prototype.initState = function (inputPath) {
        var tokens = inputPath.split('|');
        this.viewMode = tokens[0];
        switch (this.viewMode) {
            case 'equipes':
                return this.getState(tokens.slice(1));
            case 'otp':
            default:
        }
        return null;
    };
    UnMaximizeComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.queryParams.subscribe(function (queryParams) {
            var inputPath = queryParams['path'];
            _this.state = _this.initState(inputPath);
        });
    };
    UnMaximizeComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './unmaximize.component.html'
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute])
    ], UnMaximizeComponent);
    return UnMaximizeComponent;
}());
exports.UnMaximizeComponent = UnMaximizeComponent;
//# sourceMappingURL=unmaximize.component.js.map