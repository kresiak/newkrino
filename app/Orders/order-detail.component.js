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
var order_service_1 = require('../Shared/Services/order.service');
var data_service_1 = require('../Shared/Services/data.service');
var Rx_1 = require('rxjs/Rx');
var user_service_1 = require('./../Shared/Services/user.service');
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
var OrderComponentRoutable = (function () {
    function OrderComponentRoutable(orderService, route) {
        this.orderService = orderService;
        this.route = route;
    }
    OrderComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            var orderId = params['id'];
            if (orderId) {
                _this.orderObservable = _this.orderService.getAnnotedOrder(orderId);
            }
        });
    };
    OrderComponentRoutable = __decorate([
        core_1.Component({
            template: "<gg-order-detail [orderObservable]= \"orderObservable\"></gg-order-detail>"
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, router_1.ActivatedRoute])
    ], OrderComponentRoutable);
    return OrderComponentRoutable;
}());
exports.OrderComponentRoutable = OrderComponentRoutable;
var OrderDetailComponent = (function () {
    function OrderDetailComponent(orderService, route, userService, dataStore, elementRef, modalService) {
        this.orderService = orderService;
        this.route = route;
        this.userService = userService;
        this.dataStore = dataStore;
        this.elementRef = elementRef;
        this.modalService = modalService;
        this.stateChanged = new core_1.EventEmitter();
    }
    OrderDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    OrderDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.smallScreen = this.elementRef.nativeElement.querySelector('.orderDetailClass').offsetWidth < 600;
        this.orderObservable.subscribe(function (order) {
            _this.order = order;
            _this.selectableOtpsObservable = _this.orderService.getSelectableOtps();
            if (_this.order && _this.order.annotation)
                _this.order.annotation.items.forEach(function (item) {
                    item.annotation.idObservable = new Rx_1.BehaviorSubject([item.data.otpId]);
                });
        });
    };
    OrderDetailComponent.prototype.ngAfterViewInit = function () {
    };
    OrderDetailComponent.prototype.saveDelivery = function (orderItem, formData) {
        var _this = this;
        if (+formData.qty < 1)
            return;
        if (!orderItem.data.deliveries)
            orderItem.data.deliveries = [];
        var deliveryData = {
            quantity: +formData.qty,
            lotNb: formData.lot };
        if (formData.resell) {
            var prodData = {
                productId: orderItem.data.productId,
                orderId: this.order.data._id,
                quantity: formData.qty,
                factor: formData.factor };
            this.dataStore.addData('products.stock', prodData).first().subscribe(function (res) {
                deliveryData['stockId'] = res._id;
                orderItem.data.deliveries.push(deliveryData);
                _this.dataStore.updateData('orders', _this.order.data._id, _this.order.data);
            });
        }
        else {
            orderItem.data.deliveries.push(deliveryData);
            this.dataStore.updateData('orders', this.order.data._id, this.order.data);
        }
    };
    OrderDetailComponent.prototype.openModal = function (template, orderItem) {
        var _this = this;
        this.selectedDeliveryItem = orderItem;
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then(function (data) {
            _this.saveDelivery(_this.selectedDeliveryItem, data);
            _this.selectedDeliveryItem = undefined;
        }, function (res) {
        });
        promise.catch(function (err) {
        });
    };
    OrderDetailComponent.prototype.otpUpdated = function (orderItem, newOtpIds) {
        if (newOtpIds && newOtpIds.length > 0) {
            orderItem.data.otpId = newOtpIds[0];
            orderItem.annotation.idObservable.next([orderItem.data.otpId]);
            this.orderService.updateOrder(this.order.data);
        }
    };
    OrderDetailComponent.prototype.setDashlet = function () {
        this.userService.createOrderDashletForCurrentUser(this.order.data._id);
    };
    OrderDetailComponent.prototype.removeDashlet = function (dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    };
    OrderDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.order && comments) {
            this.order.data.comments = comments;
            this.dataStore.updateData('orders', this.order.data._id, this.order.data);
        }
    };
    OrderDetailComponent.prototype.beforeTabChange = function ($event) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OrderDetailComponent.prototype, "orderObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OrderDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], OrderDetailComponent.prototype, "stateChanged", void 0);
    OrderDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-order-detail',
            templateUrl: './order-detail.component.html'
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, router_1.ActivatedRoute, user_service_1.UserService, data_service_1.DataStore, core_1.ElementRef, ng_bootstrap_1.NgbModal])
    ], OrderDetailComponent);
    return OrderDetailComponent;
}());
exports.OrderDetailComponent = OrderDetailComponent;
//# sourceMappingURL=order-detail.component.js.map