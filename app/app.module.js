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
var angular2_chartist_1 = require('angular2-chartist');
var app_component_1 = require('./app.component');
var home_component_1 = require('./home.component');
var supplier_list_component_1 = require('./Suppliers/supplier-list.component');
var supplier_detail_component_1 = require('./Suppliers/supplier-detail.component');
var product_component_1 = require('./Products/product.component');
var product_list_component_1 = require('./Products/product-list.component');
var product_enter_component_1 = require('./Products/product-enter.component');
var category_list_component_1 = require('./Categories/category-list.component');
var otp_component_1 = require('./Otps/otp.component');
var otp_list_component_js_1 = require('./Otps/otp-list.component.js');
var otp_detail_component_1 = require('./Otps/otp-detail.component');
var user_component_1 = require('./Users/user.component');
var user_list_component_js_1 = require('./Users/user-list.component.js');
var equipe_detail_component_1 = require('./Equipes/equipe-detail.component');
var equipe_list_component_1 = require('./Equipes/equipe-list.component');
var pre_order_component_1 = require('./Orders/pre-order.component');
var order_detail_component_1 = require('./Orders/order-detail.component');
var order_list_component_1 = require('./Orders/order-list.component');
var dashboard_component_1 = require('./Dashboard/dashboard.component');
var dashlet_component_1 = require('./Dashboard/dashlet.component');
var mykrino_component_1 = require('./Dashboard/mykrino.component');
var editor_1 = require('./ui/editor/editor');
var editor_number_1 = require('./ui/editor/editor-number');
var checkbox_1 = require('./ui/checkbox/checkbox');
var selector_component_1 = require('./ui/selector/selector.component');
var comment_component_1 = require('./Comments/comment.component');
var comments_component_1 = require('./Comments/comments.component');
var api_service_1 = require('./Shared/Services/api.service');
var product_service_1 = require('./Shared/Services/product.service');
var supplier_service_1 = require('./Shared/Services/supplier.service');
var order_service_1 = require('./Shared/Services/order.service');
var data_service_1 = require('./Shared/Services/data.service');
var auth_service_1 = require('./Shared/Services/auth.service');
var otp_choice_service_1 = require('./Shared/Services/otp-choice.service');
var user_service_1 = require('./Shared/Services/user.service');
var chart_service_1 = require('./Shared/Services/chart.service');
var angular2_moment_1 = require('angular2-moment');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                angular2_moment_1.MomentModule,
                angular2_chartist_1.ChartistModule,
                platform_browser_1.BrowserModule,
                forms_1.FormsModule, forms_1.ReactiveFormsModule,
                http_1.HttpModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                router_1.RouterModule.forRoot([
                    { path: "suppliers", component: supplier_list_component_1.SupplierListComponent },
                    { path: "equipes", component: equipe_list_component_1.EquipeListComponent },
                    { path: "orders", component: order_list_component_1.OrderListComponentRoutable },
                    { path: "categories", component: category_list_component_1.CategoryListComponent },
                    { path: "otps", component: otp_list_component_js_1.OtpListComponentRoutable },
                    { path: "dashboard", component: dashboard_component_1.DashboardComponent },
                    { path: "mykrino", component: mykrino_component_1.MyKrinoComponent },
                    { path: "home", component: home_component_1.HomeComponent },
                    { path: "", component: home_component_1.HomeComponent, pathMatch: 'full' },
                    { path: 'preorder/:id', component: pre_order_component_1.PreOrderComponent },
                    { path: 'order/:id', component: order_detail_component_1.OrderComponentRoutable }
                ])
            ],
            declarations: [app_component_1.AppComponent, home_component_1.HomeComponent,
                comment_component_1.CommentComponent, comments_component_1.CommentsComponent,
                supplier_list_component_1.SupplierListComponent, supplier_detail_component_1.SupplierDetailComponent, product_component_1.ProductComponent, product_list_component_1.ProductListComponent, product_enter_component_1.ProductEnterComponent,
                otp_component_1.OtpComponent, otp_list_component_js_1.OtpListComponent, otp_detail_component_1.OtpDetailComponent, otp_list_component_js_1.OtpListComponentRoutable,
                category_list_component_1.CategoryListComponent,
                dashboard_component_1.DashboardComponent, dashlet_component_1.DashletComponent, mykrino_component_1.MyKrinoComponent,
                user_component_1.UserComponent, user_list_component_js_1.UserListComponent,
                equipe_detail_component_1.EquipeDetailComponent, equipe_list_component_1.EquipeListComponent,
                pre_order_component_1.PreOrderComponent, order_detail_component_1.OrderDetailComponent, order_detail_component_1.OrderComponentRoutable,
                order_list_component_1.OrderListComponent, order_list_component_1.OrderListComponentRoutable,
                editor_1.Editor, editor_number_1.EditorNumber, checkbox_1.Checkbox, selector_component_1.SelectorComponent
            ],
            providers: [otp_choice_service_1.OtpChoiceService, api_service_1.ApiService, data_service_1.DataStore, auth_service_1.AuthService, product_service_1.ProductService, supplier_service_1.SupplierService, order_service_1.OrderService, user_service_1.UserService, chart_service_1.ChartService],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map