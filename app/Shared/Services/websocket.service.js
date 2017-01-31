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
var Rx_1 = require('rxjs/Rx');
var core_1 = require('@angular/core');
var data_service_1 = require('./data.service');
var WebSocketService = (function () {
    function WebSocketService(dataStore) {
        this.dataStore = dataStore;
        this.url = 'ws://localhost:1337';
    }
    WebSocketService.prototype.init = function () {
        var _this = this;
        this.createObservableSocket().subscribe(function (data) {
            var obj = JSON.parse(data);
            if (obj && obj.collectionsUpdated) {
                obj.collectionsUpdated.forEach(function (collection) {
                    _this.dataStore.triggerDataNext(collection);
                });
            }
        });
    };
    WebSocketService.prototype.createObservableSocket = function () {
        var _this = this;
        this.ws = new WebSocket(this.url);
        return new Rx_1.Observable(function (observer) {
            _this.ws.onmessage = function (event) {
                return observer.next(event.data);
            };
            _this.ws.onerror = function (event) { return observer.error(event); };
            _this.ws.onclose = function (event) { return observer.complete(); };
        });
    };
    WebSocketService.prototype.sendMessage = function (message) {
        this.ws.send(message);
    };
    WebSocketService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(data_service_1.DataStore)), 
        __metadata('design:paramtypes', [data_service_1.DataStore])
    ], WebSocketService);
    return WebSocketService;
}());
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.service.js.map