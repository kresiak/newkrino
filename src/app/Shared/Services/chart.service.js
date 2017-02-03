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
var ChartService = (function () {
    function ChartService() {
    }
    ChartService.prototype.getSpentPieData = function (spentPercentage) {
        var ret = {
            type: 'Pie',
            data: {
                labels: ["available", "spent"]
            }
        };
        if (spentPercentage === 0) {
            ret.data.labels = ["all available"];
            ret.data['series'] = [100];
        }
        else if (spentPercentage === 100) {
            ret.data.labels = ["all spent"];
            ret.data['series'] = [0];
        }
        else {
            ret.data['series'] = [100 - spentPercentage, spentPercentage];
        }
        return ret;
    };
    ChartService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChartService);
    return ChartService;
}());
exports.ChartService = ChartService;
//# sourceMappingURL=chart.service.js.map