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
var supplier_list_routable_component_1 = require('./Suppliers/supplier-list.routable.component');
var supplier_detail_component_1 = require('./Suppliers/supplier-detail.component');
var supplier_detail_routable_component_1 = require('./Suppliers/supplier-detail.routable.component');
var product_component_1 = require('./Products/product.component');
var product_grid_component_1 = require('./Products/product-grid.component');
var product_list_component_1 = require('./Products/product-list.component');
var product_list_routable_component_1 = require('./Products/product-list.routable.component');
var product_enter_component_1 = require('./Products/product-enter.component');
var product_detail_component_1 = require('./Products/product-detail.component');
var product_detail_routable_component_1 = require('./Products/product-detail.routable.component');
var category_list_component_1 = require('./Categories/category-list.component');
var category_list_routable_component_1 = require('./Categories/category-list.routable.component');
var category_detail_component_1 = require('./Categories/category-detail.component');
var category_detail_routable_component_1 = require('./Categories/category-detail.routable.component');
var otp_component_1 = require('./Otps/otp.component');
var otp_list_component_js_1 = require('./Otps/otp-list.component.js');
var otp_list_routable_component_1 = require('./Otps/otp-list.routable.component');
var otp_detail_component_1 = require('./Otps/otp-detail.component');
var otp_detail_routable_component_1 = require('./Otps/otp-detail.routable.component');
var otp_enter_component_1 = require('./Otps/otp-enter.component');
var manip_detail_component_1 = require('./Manips/manip-detail.component');
var manip_list_component_1 = require('./Manips/manip-list.component');
var prestation_detail_1 = require('./Prestations/prestation-detail');
var prestation_list_1 = require('./Prestations/prestation-list');
var user_component_1 = require('./Users/user.component');
var user_list_component_js_1 = require('./Users/user-list.component.js');
var equipe_detail_component_1 = require('./Equipes/equipe-detail.component');
var equipe_detail_routable_component_1 = require('./Equipes/equipe-detail.routable.component');
var equipe_list_component_1 = require('./Equipes/equipe-list.component');
var equipe_list_routable_component_1 = require('./Equipes/equipe-list.routable.component');
var equipe_enter_component_1 = require('./Equipes/equipe-enter.component');
var pre_order_component_1 = require('./Orders/pre-order.component');
var order_detail_routable_component_1 = require('./Orders/order-detail.routable.component');
var order_detail_component_1 = require('./Orders/order-detail.component');
var order_list_component_1 = require('./Orders/order-list.component');
var order_list_routable_component_1 = require('./Orders/order-list.routable.component');
var stock_list_component_1 = require('./Stock/stock-list.component');
var stock_detail_component_1 = require('./Stock/stock-detail.component');
var dashboard_component_1 = require('./Dashboard/dashboard.component');
var dashlet_component_1 = require('./Dashboard/dashlet.component');
var mykrino_component_1 = require('./Dashboard/mykrino.component');
var unmaximize_component_1 = require('./Dashboard/unmaximize.component');
var editor_1 = require('./ui/editor/editor');
var editor_number_1 = require('./ui/editor/editor-number');
var editor_date_1 = require('./ui/editor/editor-date');
var editor_boolean_1 = require('./ui/editor/editor-boolean');
var checkbox_1 = require('./ui/checkbox/checkbox');
var selector_component_1 = require('./ui/selector/selector.component');
var comment_component_1 = require('./Comments/comment.component');
var comments_component_1 = require('./Comments/comments.component');
var navigation_service_1 = require('./Shared/Services/navigation.service');
var api_service_1 = require('./Shared/Services/api.service');
var product_service_1 = require('./Shared/Services/product.service');
var supplier_service_1 = require('./Shared/Services/supplier.service');
var order_service_1 = require('./Shared/Services/order.service');
var data_service_1 = require('./Shared/Services/data.service');
var auth_service_1 = require('./Shared/Services/auth.service');
var otp_choice_service_1 = require('./Shared/Services/otp-choice.service');
var user_service_1 = require('./Shared/Services/user.service');
var chart_service_1 = require('./Shared/Services/chart.service');
var prestation_service_1 = require('./Shared/Services/prestation.service');
var fulldate_pipe_1 = require('./Shared/Pipes/fulldate.pipe');
var shortdate_pipe_1 = require('./Shared/Pipes/shortdate.pipe');
var fromnow_pipe_1 = require('./Shared/Pipes/fromnow.pipe');
//import {MomentModule} from 'angular2-moment';
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                //        MomentModule,
                angular2_chartist_1.ChartistModule,
                platform_browser_1.BrowserModule,
                forms_1.FormsModule, forms_1.ReactiveFormsModule,
                http_1.HttpModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                router_1.RouterModule.forRoot([
                    { path: "suppliers", component: supplier_list_routable_component_1.SupplierListComponentRoutable },
                    { path: "equipes", component: equipe_list_routable_component_1.EquipeListComponentRoutable },
                    { path: "orders", component: order_list_routable_component_1.OrderListComponentRoutable },
                    { path: "categories", component: category_list_routable_component_1.CategoryListComponentRoutable },
                    { path: "otps", component: otp_list_routable_component_1.OtpListComponentRoutable },
                    { path: 'otp/:id', component: otp_detail_routable_component_1.OtpDetailComponentRoutable },
                    { path: 'supplier/:id', component: supplier_detail_routable_component_1.SupplierDetailComponentRoutable },
                    { path: 'product/:id', component: product_detail_routable_component_1.ProductDetailComponentRoutable },
                    { path: 'category/:id', component: category_detail_routable_component_1.CategoryDetailComponentRoutable },
                    { path: 'equipe/:id', component: equipe_detail_routable_component_1.EquipeDetailComponentRoutable },
                    { path: "products", component: product_list_routable_component_1.ProductListComponentRoutable },
                    { path: "dashboard", component: dashboard_component_1.DashboardComponent },
                    { path: "mykrino", component: mykrino_component_1.MyKrinoComponent },
                    { path: "home", component: home_component_1.HomeComponent },
                    { path: "stock", component: stock_list_component_1.StockListComponentRoutable },
                    { path: "manips", component: manip_list_component_1.ManipListComponent },
                    { path: "unmaximize", component: unmaximize_component_1.UnMaximizeComponent },
                    { path: "prestations", component: prestation_list_1.PrestationListComponent },
                    { path: "", component: home_component_1.HomeComponent, pathMatch: 'full' },
                    { path: 'preorder/:id', component: pre_order_component_1.PreOrderComponent },
                    { path: 'order/:id', component: order_detail_routable_component_1.OrderComponentRoutable },
                    { path: '**', redirectTo: '/home' }
                ])
            ],
            declarations: [app_component_1.AppComponent, home_component_1.HomeComponent,
                comment_component_1.CommentComponent, comments_component_1.CommentsComponent,
                supplier_list_component_1.SupplierListComponent, supplier_detail_component_1.SupplierDetailComponent, supplier_list_routable_component_1.SupplierListComponentRoutable, supplier_detail_routable_component_1.SupplierDetailComponentRoutable,
                product_component_1.ProductComponent, product_grid_component_1.ProductGridComponent, product_enter_component_1.ProductEnterComponent, product_list_component_1.ProductListComponent, product_list_routable_component_1.ProductListComponentRoutable, product_detail_component_1.ProductDetailComponent, product_detail_routable_component_1.ProductDetailComponentRoutable,
                otp_component_1.OtpComponent, otp_list_component_js_1.OtpListComponent, otp_detail_component_1.OtpDetailComponent, otp_detail_routable_component_1.OtpDetailComponentRoutable, otp_list_routable_component_1.OtpListComponentRoutable, otp_enter_component_1.OtpEnterComponent,
                category_list_component_1.CategoryListComponent, category_detail_component_1.CategoryDetailComponent, category_list_routable_component_1.CategoryListComponentRoutable, category_detail_routable_component_1.CategoryDetailComponentRoutable,
                stock_detail_component_1.StockDetailComponent, stock_list_component_1.StockListComponentRoutable, stock_list_component_1.StockListComponent,
                dashboard_component_1.DashboardComponent, dashlet_component_1.DashletComponent, mykrino_component_1.MyKrinoComponent, unmaximize_component_1.UnMaximizeComponent,
                user_component_1.UserComponent, user_list_component_js_1.UserListComponent,
                manip_detail_component_1.ManipDetailComponent, manip_list_component_1.ManipListComponent, prestation_detail_1.PrestationDetailComponent, prestation_list_1.PrestationListComponent,
                equipe_detail_component_1.EquipeDetailComponent, equipe_list_component_1.EquipeListComponent, equipe_list_routable_component_1.EquipeListComponentRoutable, equipe_enter_component_1.EquipeEnterComponent, equipe_detail_routable_component_1.EquipeDetailComponentRoutable,
                pre_order_component_1.PreOrderComponent, order_detail_component_1.OrderDetailComponent, order_detail_routable_component_1.OrderComponentRoutable,
                order_list_component_1.OrderListComponent, order_list_routable_component_1.OrderListComponentRoutable,
                editor_1.Editor, editor_number_1.EditorNumber, editor_date_1.EditorDate, editor_boolean_1.EditorBoolean, checkbox_1.Checkbox, selector_component_1.SelectorComponent,
                fulldate_pipe_1.FullDatePipe, shortdate_pipe_1.ShortDatePipe, fromnow_pipe_1.FromNowPipe
            ],
            providers: [navigation_service_1.NavigationService, otp_choice_service_1.OtpChoiceService, api_service_1.ApiService, data_service_1.DataStore, auth_service_1.AuthService, product_service_1.ProductService, supplier_service_1.SupplierService, order_service_1.OrderService, user_service_1.UserService, chart_service_1.ChartService, prestation_service_1.PrestationService],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map