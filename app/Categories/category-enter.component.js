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
var forms_1 = require('@angular/forms');
var data_service_1 = require('./../Shared/Services/data.service');
var CategoryEnterComponent = (function () {
    function CategoryEnterComponent(dataStore, formBuilder) {
        this.dataStore = dataStore;
        this.formBuilder = formBuilder;
    }
    //@ViewChild('labSpecifBoolean') isLaboChild;
    CategoryEnterComponent.prototype.ngOnInit = function () {
        this.categoryForm = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(5)]],
            isBlocked: [''],
            noArticle: [''],
            groupMarch: ['']
        });
    };
    CategoryEnterComponent.prototype.save = function (formValue, isValid) {
        var _this = this;
        this.dataStore.addData('categories', {
            name: formValue.name,
            isLabo: this.isLabo,
            isOffice: this.isOffice,
            isBlocked: formValue.isBlocked,
            noArticle: formValue.noArticle,
            groupMarch: formValue.groupMarch
        }).subscribe(function (res) {
            var x = res;
            _this.reset();
        });
    };
    CategoryEnterComponent.prototype.reset = function () {
        this.categoryForm.reset();
        //this.isLaboChild.emptyContent()    
    };
    CategoryEnterComponent.prototype.isLabUpdated = function (isLabs) {
        this.isLabo = isLabs;
    };
    CategoryEnterComponent.prototype.isOfficeUpdated = function (isOffices) {
        this.isOffice = isOffices;
    };
    CategoryEnterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gg-category-enter',
            templateUrl: './category-enter.component.html'
        }), 
        __metadata('design:paramtypes', [data_service_1.DataStore, forms_1.FormBuilder])
    ], CategoryEnterComponent);
    return CategoryEnterComponent;
}());
exports.CategoryEnterComponent = CategoryEnterComponent;
//# sourceMappingURL=category-enter.component.js.map