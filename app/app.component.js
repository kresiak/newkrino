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
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
var auth_service_1 = require('./Shared/Services/auth.service');
var AppComponent = (function () {
    function AppComponent(authService) {
        this.authService = authService;
        this.title = 'Krino';
        this.menu = [
            {
                route: '/home',
                title: 'Home',
                active: false
            },
            {
                route: '/dashboard',
                title: 'Dashboard',
                active: false
            },
            {
                route: '/mykrino',
                title: 'My Krino',
                active: false
            },
            {
                route: '/orders',
                title: 'Orders',
                active: false
            },
            {
                route: '/suppliers',
                title: 'Suppliers',
                active: false
            },
            {
                route: '/categories',
                title: 'Categories',
                active: false
            },
            {
                route: '/equipes',
                title: 'Equipes',
                active: false
            },
            {
                route: '/otps',
                title: 'Otps',
                active: false
            },];
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.usersObservable = this.authService.getAnnotatedUsers();
        this.usersObservable.subscribe(function (users) {
            _this.users = users;
            _this.initLoginData();
        });
    };
    AppComponent.prototype.initLoginData = function () {
        var _this = this;
        this.currentUserId = this.authService.getUserId();
        this.currentEquipeId = this.authService.getEquipeId();
        var currentUserAnnotated = this.users.filter(function (user) { return user.data._id === _this.currentUserId; })[0];
        this.possibleEquipes = currentUserAnnotated ? currentUserAnnotated.annotation.equipes : [];
        if (!this.possibleEquipes.map(function (equipe) { return equipe._id; }).includes(this.currentEquipeId) && this.possibleEquipes.length > 0) {
            var idToTake = this.possibleEquipes[0]._id;
            this.authService.setEquipeId(idToTake);
            this.currentEquipeId = idToTake;
        }
    };
    AppComponent.prototype.activateMenu = function (menuItem) {
        this.menu.forEach(function (element) {
            element.active = false;
        });
        menuItem.active = true;
    };
    AppComponent.prototype.userSelected = function (value) {
        this.authService.setUserId(value);
        this.initLoginData();
    };
    AppComponent.prototype.equipeSelected = function (value) {
        this.authService.setEquipeId(value);
        this.initLoginData();
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'giga-app',
            templateUrl: './app.component.html'
        }), 
        __metadata('design:paramtypes', [auth_service_1.AuthService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map