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
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
var auth_service_1 = require('./Shared/Services/auth.service');
var AppComponent = (function () {
    function AppComponent(authService, route, router, modalService) {
        this.authService = authService;
        this.route = route;
        this.router = router;
        this.modalService = modalService;
        this.password = '';
        this.title = 'Krino';
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.router.events.filter(function (event) { return event instanceof router_1.NavigationEnd; }).subscribe(function (event) {
            var e = event;
            var r = e.urlAfterRedirects === '/' ? '/home' : e.urlAfterRedirects;
            try {
                _this.activateMenu(_this.menu.filter(function (menuitem) { return menuitem.route === r; })[0]);
            }
            finally { }
        });
        this.authService.getAnnotatedUsers().subscribe(function (users) {
            _this.users = users;
            _this.authService.getStatusObservable().subscribe(function (statusInfo) {
                _this.authorizationStatusInfo = statusInfo;
                var currentUserAnnotated = _this.users.filter(function (user) { return user.data._id === statusInfo.currentUserId; })[0];
                _this.possibleEquipes = currentUserAnnotated ? currentUserAnnotated.annotation.equipes : [];
                _this.initMenu(statusInfo);
            });
        });
    };
    AppComponent.prototype.openModal = function (template) {
        var _this = this;
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "sm" });
        var promise = ref.result;
        promise.then(function (res) {
            _this.passwordSave();
        }, function (res) {
            _this.passwordCancel();
        });
        promise.catch(function (err) {
            _this.passwordCancel();
        });
    };
    AppComponent.prototype.passwordSave = function () {
        this.authService.tryLogin(this.password);
    };
    AppComponent.prototype.passwordCancel = function () {
    };
    AppComponent.prototype.userSelected = function (value) {
        this.authService.setUserId(value);
    };
    AppComponent.prototype.equipeSelected = function (value) {
        this.authService.setEquipeId(value);
    };
    AppComponent.prototype.initMenu = function (statusInfo) {
        var isLoggedIn = statusInfo.isLoggedIn;
        this.menu = [
            {
                route: '/home',
                title: 'Home',
                active: false
            },
            {
                route: '/dashboard',
                title: 'Dashboard',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/mykrino',
                title: 'My Krino',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/orders',
                title: 'Orders',
                active: false
            },
            {
                route: '/products',
                title: 'Products',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/suppliers',
                title: 'Suppliers',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/stock',
                title: 'Stock',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/categories',
                title: 'Categories',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/equipes',
                title: 'Equipes',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/otps',
                title: 'Otps',
                active: false,
                hide: !isLoggedIn
            },
            {
                route: '/manips',
                title: 'Manips',
                active: false,
                hide: true
            },
            {
                route: '/prestations',
                title: 'Prestations',
                active: false,
                hide: true
            },
            {
                route: '/admin',
                title: 'Administration',
                active: false,
                hide: !isLoggedIn || !statusInfo.isAdministrator()
            },
            {
                route: '/reception',
                title: 'Reception',
                active: false,
                hide: false
            }
        ];
        this.menu = this.menu.filter(function (item) { return !item.hide; });
    };
    AppComponent.prototype.activateMenu = function (menuItem) {
        this.menu.forEach(function (element) {
            element.active = false;
        });
        if (menuItem)
            menuItem.active = true;
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'giga-app',
            templateUrl: './app.component.html'
        }), 
        __metadata('design:paramtypes', [auth_service_1.AuthService, router_1.ActivatedRoute, router_1.Router, ng_bootstrap_1.NgbModal])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map