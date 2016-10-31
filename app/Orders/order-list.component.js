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
var order_service_1 = require('./../Shared/Services/order.service');
var Rx_1 = require('rxjs/Rx');
var forms_1 = require('@angular/forms');
var OrderListComponentRoutable = (function () {
    function OrderListComponentRoutable(orderService) {
        this.orderService = orderService;
    }
    OrderListComponentRoutable.prototype.ngOnInit = function () {
        this.ordersObservable = this.orderService.getAnnotedOrders();
    };
    OrderListComponentRoutable = __decorate([
        core_1.Component({
            template: "<gg-order-list [ordersObservable]= \"ordersObservable\"></gg-order-list>"
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService])
    ], OrderListComponentRoutable);
    return OrderListComponentRoutable;
}());
exports.OrderListComponentRoutable = OrderListComponentRoutable;
var OrderListComponent = (function () {
    function OrderListComponent() {
        this.searchControl = new forms_1.FormControl();
        this.searchForm = new forms_1.FormGroup({
            searchControl: new forms_1.FormControl()
        });
    }
    OrderListComponent.prototype.ngOnInit = function () {
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
                    || order.annotation.equipe.toUpperCase().includes(txt);
            });
        });
    };
    OrderListComponent.prototype.getOrderObservable = function (id) {
        return this.ordersObservable.map(function (orders) { return orders.filter(function (s) { return s.data._id === id; })[0]; });
    };
    OrderListComponent.prototype.formatDate = function (date) {
        return (new Date(date)).toLocaleDateString();
    };
    OrderListComponent.prototype.showColumn = function (columnName) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OrderListComponent.prototype, "ordersObservable", void 0);
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