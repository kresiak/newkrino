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
var ng2_simple_page_scroll_1 = require('ng2-simple-page-scroll/ng2-simple-page-scroll');
var NavStackElement = (function () {
    function NavStackElement(lastPosition, path) {
        this.lastPosition = -1;
        this.lastPosition = lastPosition;
        this.path = path;
    }
    return NavStackElement;
}());
var Path2StateHelper = (function () {
    function Path2StateHelper(path) {
        this.separator = '|';
        this.path = path;
        this.tokens = this.path.split(this.separator);
    }
    Path2StateHelper.prototype.getCmd = function () {
        return this.tokens[0];
    };
    Path2StateHelper.prototype.isForDetailView = function () {
        var cmd = this.getCmd();
        return cmd.charAt(cmd.length - 1).toUpperCase() !== 'S' && cmd.toUpperCase() !== 'DASHBOARD';
    };
    Path2StateHelper.prototype.generateState = function (arrPath) {
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
    Path2StateHelper.prototype.getNavigationCommands = function () {
        var link = ['/' + this.getCmd()];
        if (this.isForDetailView())
            link.push(this.tokens[1]);
        return link;
    };
    Path2StateHelper.prototype.getState = function () {
        var tokens = this.tokens.slice(this.isForDetailView() ? 2 : 1);
        return this.generateState(tokens);
    };
    return Path2StateHelper;
}());
var NavigationService = (function () {
    function NavigationService(router, route, simplePageScrollService) {
        this.router = router;
        this.route = route;
        this.simplePageScrollService = simplePageScrollService;
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
            else if (lastPathId || lastPathId === 0) {
                var stackElement = _this.navStack[lastPathId];
                if (stackElement) {
                    var path = stackElement.path;
                    var helper = new Path2StateHelper(path);
                    var navigationExtras = {
                        queryParams: {}
                    };
                    if (stackElement.lastPosition && stackElement.lastPosition != -1) {
                        navigationExtras.queryParams['lpid'] = stackElement.lastPosition;
                    }
                    navigationExtras.queryParams['pid'] = lastPathId;
                    _this.router.navigate(helper.getNavigationCommands(), navigationExtras);
                }
            }
        });
    };
    NavigationService.prototype.getStateObservable = function () {
        var _this = this;
        return this.route.queryParams.first().map(function (queryParams) {
            var pathId = queryParams['pid'];
            if (pathId || pathId === 0) {
                var stackElement = _this.navStack[pathId];
                if (!stackElement)
                    return {};
                var path = stackElement.path;
                var helper = new Path2StateHelper(path);
                return helper.getState();
            }
            else {
                return {};
            }
        });
    };
    NavigationService.prototype.jumpToOpenRootAccordionElement = function () {
        var _this = this;
        this.route.queryParams.first().subscribe(function (queryParams) {
            var pathId = queryParams['pid'];
            if (pathId || pathId === 0) {
                var stackElement = _this.navStack[pathId];
                if (!stackElement)
                    return;
                var path = stackElement.path;
                var helper = new Path2StateHelper(path);
                if (helper.isForDetailView())
                    return;
                var state = helper.getState();
                if (state['openPanelId']) {
                    _this.simplePageScrollService.scrollToElement('#' + state['openPanelId'], 0); //in every list component, in the html, we put a  id 
                }
            }
        });
    };
    NavigationService.prototype.jumpToTop = function () {
        this.simplePageScrollService.scrollToElement('#GGTOP', 0);
    };
    NavigationService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [router_1.Router, router_1.ActivatedRoute, ng2_simple_page_scroll_1.SimplePageScrollService])
    ], NavigationService);
    return NavigationService;
}());
exports.NavigationService = NavigationService;
//# sourceMappingURL=navigation.service.js.map