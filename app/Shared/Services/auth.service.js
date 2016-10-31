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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var data_service_1 = require('./data.service');
var Rx_1 = require('rxjs/Rx');
var AuthService = (function () {
    function AuthService(dataStore) {
        this.dataStore = dataStore;
        this.currentUserId = '58020b9893e81802c5936af3';
        this.currentEquipeId = '58020f2693e81802c5936afc';
        this.currentUserIdObservable = new Rx_1.BehaviorSubject(this.currentUserId);
    }
    AuthService.prototype.createAnnotatedUser = function (user, equipes) {
        if (!user)
            return null;
        var filteredEquipes = equipes.filter(function (equipe) { return equipe.Users.includes(user._id); });
        return {
            data: user,
            annotation: {
                fullName: user.firstName + ' ' + user.name,
                equipes: filteredEquipes
            }
        };
    };
    AuthService.prototype.getAnnotatedUsers = function () {
        var _this = this;
        return Rx_1.Observable.combineLatest(this.dataStore.getDataObservable('krinousers'), this.dataStore.getDataObservable('equipes'), function (users, equipes) {
            return users.map(function (user) { return _this.createAnnotatedUser(user, equipes); });
        });
    };
    AuthService.prototype.getAnnotatedCurrentUser = function () {
        var currentUserId = this.getUserId();
        return this.getAnnotatedUsers().map(function (users) {
            var usersFiltered = users.filter(function (user) { return user.data._id === currentUserId; });
            return usersFiltered.length === 0 ? null : usersFiltered[0];
        });
    };
    AuthService.prototype.getUserId = function () {
        return this.currentUserId;
    };
    AuthService.prototype.getUserIdObservable = function () {
        return this.currentUserIdObservable;
    };
    AuthService.prototype.setUserId = function (id) {
        this.currentUserId = id;
        this.currentUserIdObservable.next(id);
    };
    AuthService.prototype.isAuthenticated = function () {
        return true;
    };
    AuthService.prototype.getEquipeId = function () {
        return this.currentEquipeId;
    };
    AuthService.prototype.setEquipeId = function (id) {
        this.currentEquipeId = id;
    };
    AuthService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(data_service_1.DataStore)), 
        __metadata('design:paramtypes', [data_service_1.DataStore])
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map