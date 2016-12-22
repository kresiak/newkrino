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
var Rx_1 = require('rxjs/Rx');
var data_service_1 = require('./../Shared/Services/data.service');
var product_service_1 = require('./../Shared/Services/product.service');
var order_service_1 = require('./../Shared/Services/order.service');
var user_service_1 = require('./../Shared/Services/user.service');
var chart_service_1 = require('./../Shared/Services/chart.service');
var OtpDetailComponentRoutable = (function () {
    function OtpDetailComponentRoutable(orderService, route) {
        this.orderService = orderService;
        this.route = route;
    }
    OtpDetailComponentRoutable.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            var otpId = params['id'];
            if (otpId) {
                _this.otpObservable = _this.orderService.getAnnotatedOtpById(otpId);
                _this.otpObservable.subscribe(function (otp) {
                    _this.otp = otp;
                });
            }
        });
    };
    OtpDetailComponentRoutable = __decorate([
        core_1.Component({
            template: "<div class=\"card\" *ngIf=\"otp\"><div class=\"card-block\"><h6>Otp {{otp.data.name}}</h6> <gg-otp-detail [otpObservable]= \"otpObservable\"></gg-otp-detail></div></div>"
        }), 
        __metadata('design:paramtypes', [order_service_1.OrderService, router_1.ActivatedRoute])
    ], OtpDetailComponentRoutable);
    return OtpDetailComponentRoutable;
}());
exports.OtpDetailComponentRoutable = OtpDetailComponentRoutable;
var OtpDetailComponent = (function () {
    function OtpDetailComponent(dataStore, productService, orderService, userService, chartService, router) {
        this.dataStore = dataStore;
        this.productService = productService;
        this.orderService = orderService;
        this.userService = userService;
        this.chartService = chartService;
        this.router = router;
        this.stateChanged = new core_1.EventEmitter();
    }
    OtpDetailComponent.prototype.stateInit = function () {
        if (!this.state)
            this.state = {};
        if (!this.state.selectedTabId)
            this.state.selectedTabId = '';
    };
    OtpDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.otpObservable.map(function (otp) { return otp.data.categoryIds; });
        this.otpObservable.subscribe(function (otp) {
            _this.otp = otp;
            if (otp) {
                _this.pieSpentChart = _this.chartService.getSpentPieData(_this.otp.annotation.amountSpent / _this.otp.annotation.budget * 100);
                _this.ordersObservable = _this.orderService.getAnnotedOrdersByOtp(otp.data._id);
                _this.orderService.hasOtpAnyOrder(otp.data._id).subscribe(function (anyOrder) { return _this.anyOrder = anyOrder; });
            }
        });
    };
    OtpDetailComponent.prototype.categorySelectionChanged = function (selectedIds) {
        this.otp.data.categoryIds = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.categoryHasBeenAdded = function (newCategory) {
        this.productService.createCategory(newCategory);
    };
    OtpDetailComponent.prototype.setDashlet = function () {
        this.userService.createOtpDashletForCurrentUser(this.otp.data._id);
    };
    OtpDetailComponent.prototype.removeDashlet = function (dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    };
    OtpDetailComponent.prototype.commentsUpdated = function (comments) {
        if (this.otp && comments) {
            this.otp.data.comments = comments;
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
        }
    };
    OtpDetailComponent.prototype.beforeTabChange = function ($event) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            var link = ['/otp', this.otp.data._id];
            this.router.navigate(link);
            return;
        }
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
    ;
    OtpDetailComponent.prototype.childOrdersStateChanged = function ($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    };
    OtpDetailComponent.prototype.dateUpdated = function (date) {
        this.otp.data.datEnd = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.dateUpdatedStart = function (date) {
        this.otp.data.datStart = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.nameUpdated = function (name) {
        this.otp.data.name = name;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.budgetUpdated = function (budget) {
        this.otp.data.budget = budget;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.blockedUpdated = function (block) {
        this.otp.data.isBlocked = block;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    OtpDetailComponent.prototype.closedUpdated = function (close) {
        this.otp.data.isClosed = close;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Rx_1.Observable)
    ], OtpDetailComponent.prototype, "otpObservable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], OtpDetailComponent.prototype, "state", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], OtpDetailComponent.prototype, "stateChanged", void 0);
    OtpDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-otp-detail',
            templateUrl: './otp-detail.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, product_service_1.ProductService, order_service_1.OrderService, user_service_1.UserService, chart_service_1.ChartService, router_1.Router])
    ], OtpDetailComponent);
    return OtpDetailComponent;
}());
exports.OtpDetailComponent = OtpDetailComponent;
//# sourceMappingURL=otp-detail.component.js.map