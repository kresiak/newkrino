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
var Rx_1 = require('rxjs/Rx');
var forms_1 = require('@angular/forms');
var moment = require("moment");
var OrderListComponent = (function () {
    function OrderListComponent() {
        this.searchControl = new forms_1.FormControl();
        this.path = 'orders';
        this.stateChanged = new core_1.EventEmitter();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    OrderListComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.openPanelId)
            this.state.openPanelId = '';
    };
    OrderListComponent.prototype.ngOnInit = function () {
        this.stateInit();
        this.orders2Observable = Rx_1.Observable.combineLatest(this.ordersObservable, this.searchControl.valueChanges.startWith(''), function (orders, searchTxt) {
            var txt = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '$' || txt === '$>' || txt === '$<' || txt === '#')
                return orders;
            return orders.filter(function (order) {
                if (txt.startsWith('#')) {
                    var txt2_1 = txt.slice(1);
                    return order.annotation.items.filter(function (item) {
                        return item.annotation.description.toUpperCase().includes(txt2_1);
                    }).length > 0;
                }
                if (txt.startsWith('$>') && +txt.slice(2)) {
                    var montant = +txt.slice(2);
                    return +order.annotation.total >= montant;
                }
                if (txt.startsWith('$<') && +txt.slice(2)) {
                    var montant = +txt.slice(2);
                    return +order.annotation.total <= montant;
                }
                return order.annotation.user.toUpperCase().includes(txt)
                    || order.annotation.supplier.toUpperCase().includes(txt)
                    || order.annotation.equipe.toUpperCase().includes(txt)
                    || order.data.kid === +txt;
            });
        });
    };
    OrderListComponent.prototype.getOrderObservable = function (id) {
        return this.ordersObservable.map(function (orders) { return orders.filter(function (s) { return s.data._id === id; })[0]; });
    };
    OrderListComponent.prototype.formatDate = function (date) {
        var now = moment();
        var then = moment(date, 'DD/MM/YYYY hh:mm:ss');
        var diff = now.diff(then, 'days');
        //var md= moment(date, 'DD/MM/YYYY hh:mm:ss').fromNow()
        return diff < 15 ? then.fromNow() : then.format('LLLL');
    };
    OrderListComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    OrderListComponent.prototype.beforeAccordionChange = function ($event) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };
    ;
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    OrderListComponent.prototype.childStateChanged = function (newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OrderListComponent.prototype, "ordersObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OrderListComponent.prototype, "state", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], OrderListComponent.prototype, "path", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], OrderListComponent.prototype, "stateChanged", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OrderListComponent.prototype, "config", void 0);
    OrderListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-order-list',
            templateUrl: './order-list.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], OrderListComponent);
    return OrderListComponent;
}());
exports.OrderListComponent = OrderListComponent;
//# sourceMappingURL=order-list.component.js.map