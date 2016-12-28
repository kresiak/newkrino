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
var NavStackElement = (function () {
    function NavStackElement(lastPosition, path) {
        this.lastPosition = -1;
        this.lastPosition = lastPosition;
        this.path = path;
    }
    return NavStackElement;
}());
var NavigationService = (function () {
    function NavigationService(router, route) {
        this.router = router;
        this.route = route;
        this.navStack = [];
    }
    NavigationService.prototype.addStackElement = function (lastPosition, path) {
        var element = new NavStackElement(lastPosition, path);
        this.navStack.push(element);
        return this.navStack.length - 1;
    };
    NavigationService.prototype.maximizeOrUnmaximize = function (urlPath, id, currentPath, isRoot) {
        var _this = this;
        this.route.queryParams.first().subscribe(function (queryParams) {
            var lastPathId = +queryParams['lpid'];
            if (!isRoot) {
                var newPathId = _this.addStackElement(lastPathId, currentPath);
                var link = [urlPath, id];
                var navigationExtras = {
                    queryParams: { 'lpid': newPathId }
                };
                _this.router.navigate(link, navigationExtras);
            }
            else {
                var stackElement = _this.navStack[lastPathId];
                if (stackElement) {
                    var path = stackElement.path;
                    var tokens = path.split('|');
                    var cmd = tokens[0];
                    var link = [cmd];
                    if (_this.isPathForDetailView(cmd))
                        link.push(tokens[1]);
                    var state = tokens.slice(_this.isPathForDetailView(cmd) ? 2 : 1).join('|');
                    var navigationExtras = {
                        queryParams: {}
                    };
                    if (stackElement.lastPosition && stackElement.lastPosition != -1) {
                        navigationExtras.queryParams['lpid'] = stackElement.lastPosition;
                    }
                    navigationExtras.queryParams['state'] = state;
                    _this.router.navigate(link, navigationExtras);
                }
            }
        });
    };
    NavigationService.prototype.isPathForDetailView = function (cmd) {
        return cmd.charAt(cmd.length - 1).toUpperCase() !== 'S';
    };
    NavigationService.prototype.generateState = function (arrPath) {
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
    NavigationService.prototype.initState = function (inputPath) {
        var tokens = inputPath.split('|');
        var viewMode = tokens[0];
        switch (viewMode) {
            case 'equipes':
                return this.generateState(tokens.slice(1));
            case 'otp':
            default:
        }
        return null;
    };
    NavigationService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [router_1.Router, router_1.ActivatedRoute])
    ], NavigationService);
    return NavigationService;
}());
exports.NavigationService = NavigationService;
//# sourceMappingURL=navigation.service.js.map