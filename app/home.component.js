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
var supplier_service_1 = require('./Shared/Services/supplier.service');
var HomeComponent = (function () {
    function HomeComponent(supplierService) {
        this.supplierService = supplierService;
        this.errFn = function (err) { console.log('Error: ' + err); };
        /*        var interval = Observable.interval(1000);
        
                var source = interval
                    .take(2)
                    .do(function (x) {
                        console.log('Side effect');
                    });
        
                var published = source.publishReplay(1).refCount();
        
        
                published.subscribe(x => console.log('Next sourceA: ' + x), this.errFn, () => console.log('Complete sourceA'));
                published.subscribe(x => console.log('Next sourceB: ' + x), this.errFn, () => console.log('Complete sourceB'));
        
                setTimeout(function () {
                    published.subscribe(x => console.log('Next sourceC: ' + x), this.errFn, () => console.log('Complete sourceC'));
                }, 6000);
        */ }
    HomeComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.supplierService.getAnnotatedReceptions().map(function (receptions) { return receptions.filter(function (reception) { return !reception.data.isProcessed; }); }).subscribe(function (receptions) {
            _this.receptionList = receptions ? receptions : [];
        });
    };
    HomeComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: './home.component.html'
        }), 
        __metadata('design:paramtypes', [supplier_service_1.SupplierService])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map