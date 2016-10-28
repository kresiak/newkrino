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
var AppComponent = (function () {
    function AppComponent() {
        this.title = 'Krino';
        this.menu = [
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
    AppComponent.prototype.activateMenu = function (menuItem) {
        this.menu.forEach(function (element) {
            element.active = false;
        });
        menuItem.active = true;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'giga-app',
            template: " \n        <template ngbModalContainer></template>\n        <div class=\"card\">\n            <div class=\"card-block\">\n                <h3 class=\"card-title\">{{title}}</h3>\n                <nav>\n                    <a *ngFor=\"let menuItem of menu\" class=\"btn btn-outline-secondary\"  [class.active]=\"menuItem.active\" (click)=\"activateMenu(menuItem)\" routerLink=\"{{menuItem.route}}\">{{menuItem.title}}</a>\n                </nav>\n                \n                <router-outlet></router-outlet>    \n            </div>\n        </div>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map