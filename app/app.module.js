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
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var router_1 = require('@angular/router');
var http_1 = require('@angular/http');
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
var app_component_1 = require('./app.component');
var heroes_component_1 = require('./heroes.component');
var dashboard_component_1 = require('./dashboard.component');
var hero_detail_component_1 = require('./hero-detail.component');
var hero_service_1 = require('./hero.service');
var supplier_list_component_1 = require('./Suppliers/supplier-list.component');
var supplier_detail_component_1 = require('./Suppliers/supplier-detail.component');
var product_component_1 = require('./Products/product.component');
var product_list_component_1 = require('./Products/product-list.component');
var otp_component_1 = require('./Otps/otp.component');
var otp_list_component_js_1 = require('./Otps/otp-list.component.js');
var user_component_1 = require('./Users/user.component');
var user_list_component_js_1 = require('./Users/user-list.component.js');
var equipe_detail_component_1 = require('./Equipes/equipe-detail.component');
var equipe_list_component_1 = require('./Equipes/equipe-list.component');
var editor_1 = require('./ui/editor/editor');
var checkbox_1 = require('./ui/checkbox/checkbox');
var selector_component_1 = require('./ui/selector/selector.component');
var api_service_1 = require('./Shared/Services/api.service');
var data_service_1 = require('./Shared/Services/data.service');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                router_1.RouterModule.forRoot([
                    { path: "suppliers", component: supplier_list_component_1.SupplierListComponent },
                    { path: "equipes", component: equipe_list_component_1.EquipeListComponent },
                    { path: "heroes", component: heroes_component_1.HeroesComponent },
                    { path: "dashboard", component: dashboard_component_1.DashboardComponent },
                    { path: "", component: dashboard_component_1.DashboardComponent, pathMatch: 'full' },
                    { path: 'detail/:id', component: hero_detail_component_1.HeroDetailComponent }
                ])
            ],
            declarations: [app_component_1.AppComponent, supplier_list_component_1.SupplierListComponent, supplier_detail_component_1.SupplierDetailComponent, product_component_1.ProductComponent, product_list_component_1.ProductListComponent, heroes_component_1.HeroesComponent, hero_detail_component_1.HeroDetailComponent, dashboard_component_1.DashboardComponent,
                otp_component_1.OtpComponent, otp_list_component_js_1.OtpListComponent, user_component_1.UserComponent, user_list_component_js_1.UserListComponent, equipe_detail_component_1.EquipeDetailComponent, equipe_list_component_1.EquipeListComponent,
                editor_1.Editor, checkbox_1.Checkbox, selector_component_1.SelectorComponent
            ],
            providers: [hero_service_1.HeroService, api_service_1.ApiService, data_service_1.DataStore, data_service_1.DataObservables],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map